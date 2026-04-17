import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Order, OrderStatus } from '@prisma/client';
import { StripeService } from '../stripe/stripe.service';
import { TwilioService } from '../twilio/twilio.service';
import { TookanService } from '../tookan/tookan.service';
import { extractOutcode, calculateProximityScore } from '../common/utils/postcode.util';
import { PostcodesService } from '../postcodes/postcodes.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private stripe: StripeService,
        private twilio: TwilioService,
        private tookan: TookanService,
        private postcodesService: PostcodesService,
        @InjectQueue('notifications') private notificationsQueue: Queue,
        @InjectQueue('deliveries') private deliveriesQueue: Queue,
    ) { }

    async create(data: Prisma.OrderCreateInput, customerId: string): Promise<Order> {
        let subtotal = 0;
        let complexCount = 0;
        let complexityFlag = false;

        const items = data.items?.create;
        if (Array.isArray(items)) {
            for (const item of items) {
                // Determine dynamic pricing additions
                let customCost = 0;
                if (item.weight === '2kg' || item.weight === '1.5kg') customCost += 3;
                if (item.fatPreference === 'No Fat') customCost += 1;
                if (item.packingStyle === 'Individually Packed') customCost += 2;

                const itemPrice = Number(item.priceAtTime || 0) + customCost;

                // Determine complexity for flag & prep time
                let itemComplexities = 0;
                if (item.cutType && item.cutType !== 'Standard') itemComplexities++;
                if (item.fatPreference && item.fatPreference !== 'Standard') itemComplexities++;
                if (item.bonePreference && item.bonePreference !== 'Bone In') itemComplexities++;
                if (item.packingStyle && item.packingStyle !== 'Single Pack') itemComplexities++;
                if (item.specialNotes && item.specialNotes.length > 10) itemComplexities++;
                if (item.texture || item.grind) itemComplexities += 2; // Mince configs

                complexCount += itemComplexities;

                // Re-assign processed price constraints
                item.priceAtTime = itemPrice;
                subtotal += (itemPrice * (item.quantity || 1));
            }
        }

        // Set complexity flag based on total complexity score
        if (complexCount >= 3) complexityFlag = true;

        // 0. Pre-Flight Checks: Stock Validation
        if (Array.isArray(items)) {
            for (const item of items) {
                const anyItem = item as any;
                const productId = anyItem.productId || anyItem.product?.connect?.id;
                
                if (!productId) {
                    throw new BadRequestException('Product ID is missing from one of the order items.');
                }

                const product = await this.prisma.product.findUnique({
                    where: { id: productId },
                    include: { stock: true }
                });

                if (!product) {
                    throw new BadRequestException(`Product ${productId} not found.`);
                }

                // Auto-initialize stock if missing (e.g. seed data without stock records)
                if (!product.stock) {
                    await this.prisma.productStock.create({
                        data: { productId, quantity: 999, lowStockThreshold: 5 }
                    });
                } else if (Number(product.stock.quantity) < (item.quantity || 1)) {
                    throw new BadRequestException(`Insufficient stock for ${product.name}. Only ${product.stock.quantity} left.`);
                }
            }
        }

        // 0.5. Pre-Flight Checks: Delivery Postcode Coverage
        let postcodeStr = '';
        if ((data.address?.create as any)?.postcodeCode) {
            postcodeStr = (data.address.create as any).postcodeCode;
        } else if ((data as any).addressId || data.address?.connect?.id) {
            const addrId = (data as any).addressId || data.address?.connect?.id;
            const existingAddress = await this.prisma.address.findUnique({ where: { id: addrId }});
            if (existingAddress) postcodeStr = existingAddress.postcodeCode;
        }

        let supplierId = (data as any).supplierId || data.supplier?.connect?.id;

        if (!supplierId && postcodeStr) {
            // Auto-Discovery: Find the best proximal active supplier
            const basePostcode = postcodeStr.split(' ')[0].toUpperCase();
            
            const activeSuppliers = await this.prisma.supplier.findMany({
                where: { status: 'ACTIVE' },
                include: { coverage: true }
            });

            // Score them
            const scored = activeSuppliers.map(s => {
                const sOutcode = extractOutcode(s.postcode || s.address);
                const pScore = calculateProximityScore(basePostcode, sOutcode);
                const covers = s.coverage.some(p => p.postcodeId === basePostcode);
                
                // Final Score: Proximity + Coverage Bonus
                const finalScore = pScore + (covers ? 100 : 0);
                return { id: s.id, finalScore };
            });

            // Sort and pick the best (at least one supplier must exist)
            scored.sort((a, b) => b.finalScore - a.finalScore);
            
            if (scored.length > 0 && scored[0].finalScore > 0) {
                supplierId = scored[0].id;
                console.log(`[Orders] Auto-assigned Order to Supplier ${supplierId} based on score ${scored[0].finalScore}`);
            }
        }

        if (!supplierId) {
             console.log(`[Orders] No supplier found for postcode ${postcodeStr}. Order will remain unassigned for Admin manual linking.`);
        }

        if (postcodeStr) {
            const basePostcode = postcodeStr.split(' ')[0].toUpperCase();
            
            // Check if the overall postcode is active
            const validPostcode = await this.prisma.postcode.findFirst({
                where: { code: basePostcode, active: true }
            });

            if (!validPostcode) {
                console.warn(`[Orders] Delivery postcode ${basePostcode} is not in the recognized coverage list. Proceeding anyway per Admin bypass.`);
            }

            // Check if THIS supplier covers THIS postcode
            const coverage = await this.prisma.supplierPostcode.findFirst({
                where: {
                    supplierId,
                    postcodeId: basePostcode // assuming postcodes in DB are stored as outcodes like 'E1', 'IG11'
                }
            });

            if (!coverage && validPostcode) {
                 console.log(`[Orders] Warning: Supplier ${supplierId} does not officially cover ${basePostcode}, but proceeding anyway.`);
            }
        }

        // 1. Calculate totals
        let deliveryFee = 3.99;
        const addressPayloadForFee = (data as any).address;
        // Only overwrite postcodeStr if a new value is actually present
        const newPostcodeStr = addressPayloadForFee?.create?.postcode || addressPayloadForFee?.create?.postcodeCode;
        if (newPostcodeStr) {
            postcodeStr = newPostcodeStr;
        }

        if (postcodeStr) {
            // Normalize to outcode before looking up the delivery fee
            const outcodeForFee = postcodeStr.split(' ')[0].toUpperCase();
            const areaInfo = await this.postcodesService.checkRoute(outcodeForFee);
            if (areaInfo && areaInfo.deliveryFee) {
                deliveryFee = Number(areaInfo.deliveryFee);
            }
        }
        
        const totalAmount = subtotal + deliveryFee;

        // 3. Create Order & Deduct Stock Transactionally
        const createdOrder = await this.prisma.$transaction(async (tx) => {
            // 3a. Remap address fields: frontend sends postcode (raw string),
            //    but schema now requires postcodeCode (FK to Postcode table).
            //    Auto-upsert the Postcode record so FK constraint is always satisfied.
            let addressPayload = (data as any).address;
            if (addressPayload?.create) {
                const rawPostcode = addressPayload.create.postcode || addressPayload.create.postcodeCode || '';
                const normalizedCode = rawPostcode.split(' ')[0].toUpperCase() || 'UNKNOWN';

                // Ensure Postcode record exists
                await tx.postcode.upsert({
                    where: { code: normalizedCode },
                    update: {},
                    create: { code: normalizedCode, active: false, deliveryFee: 3.99 },
                });

                // Rebuild address without raw `postcode` string, using FK field instead
                const { postcode: _drop, postcodeCode: _drop2, ...restAddress } = addressPayload.create;
                addressPayload = {
                    create: {
                        ...restAddress,
                        postcodeCode: normalizedCode,
                    },
                };
            }

            // 3b. Prepare Final Order Data
            const orderId = `TEZA-${Date.now()}`;
            const { customer, address: _oldAddress, supplier, ...rest } = data as any;
            const orderData: any = {
                ...rest,
                orderNumber: orderId,
                subtotal,
                totalAmount,
                customer: customerId ? { connect: { id: customerId } } : undefined,
                complexityFlag,
                status: OrderStatus.PENDING_PAYMENT,
                address: addressPayload,
                ...(supplierId ? { supplier: { connect: { id: supplierId } } } : {}),
                guestEmail: null,
                guestPhone: null,
            };

            const order = await tx.order.create({
                data: orderData,
                include: {
                    items: true,
                    customer: true,
                }
            });

            // 3c. Deduct Stock
            if (Array.isArray(items)) {
                for (const item of items) {
                    const anyItem = item as any;
                    const productId = anyItem.productId || anyItem.product?.connect?.id;

                    if (productId) {
                        await tx.productStock.update({
                            where: { productId },
                            data: {
                                quantity: {
                                    decrement: item.quantity || 1
                                }
                            }
                        });
                    }
                }
            }

            return order;
        }, {
            timeout: 15000 // Increase timeout to 15s to prevent early closure during busy periods
        });

        // 4. Create Stripe PaymentIntent and Link to new Payment Model
        const paymentIntent = await this.stripe.createPaymentIntent(totalAmount, {
            orderId: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
        });

        await this.prisma.payment.create({
            data: {
                orderId: createdOrder.id,
                stripePaymentId: paymentIntent.id,
                amount: totalAmount,
                status: 'PENDING',
                method: 'card', // can be updated by webhook later
            }
        });

        return {
            ...createdOrder,
            clientSecret: paymentIntent.client_secret,
        } as any;
    }

    async confirmOrder(orderId: string): Promise<Order> {
        console.log(`--- 🔄 Confirming Order: ${orderId} ---`);
        
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: { 
                status: OrderStatus.CONFIRMED,
                payment: {
                    update: {
                        status: 'SUCCEEDED'
                    }
                }
            },
            include: {
                items: true,
                customer: true,
                supplier: true,
                payment: true,
            }
        });

        // Twilio SMS
        const phone = order.guestPhone || order.customer?.phone;
        if (phone) {
            await this.notificationsQueue.add('sms', {
                phone,
                message: `Your TEZA order ${order.orderNumber} is confirmed. Est: ${order.complexityFlag ? '60 mins' : '45 mins'}.`
            });
        }

        return order;
    }

    async findAll(): Promise<Order[]> {
        return this.prisma.order.findMany({
            include: { items: true, customer: true, supplier: true }
        });
    }

    async findMyOrders(customerId: string): Promise<Order[]> {
        if (!customerId) return [];
        return this.prisma.order.findMany({
            where: { customerId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findSupplierOrders(supplierId: string): Promise<Order[]> {
        return this.prisma.order.findMany({
            where: { supplierId },
            include: { 
                items: {
                    include: { 
                        product: {
                            include: { categoryObj: true }
                        }
                    }
                }, 
                customer: {
                    include: { user: true }
                }, 
                payment: true, 
                address: true 
            }
        });
    }

    async syncPaymentStatus(orderId: string): Promise<Order> {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        const payment = order.payment;

        if (!payment?.stripePaymentId) {
            throw new BadRequestException('No Stripe payment found for this order');
        }

        const paymentIntent = await this.stripe.retrievePaymentIntent(payment.stripePaymentId);
        
        if (paymentIntent.status === 'succeeded') {
            return this.confirmOrder(orderId);
        }

        return this.findOne(orderId);
    }

    async findOne(id: string): Promise<any> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { 
                items: { include: { product: true } }, 
                customer: { include: { user: true } }, 
                address: true,
                supplier: true,
                payment: true
            }
        });

        if (!order) return null;

        const payment = order.payment as any;

        if (payment?.stripePaymentId) {
            try {
                const intent = await this.stripe.retrievePaymentIntent(payment.stripePaymentId);
                return { 
                    ...order, 
                    stripeStatus: intent.status,
                    stripeAmountReceived: intent.amount_received,
                    stripeCurrency: intent.currency
                };
            } catch (e) {
                console.error('Stripe retrieval failed', e);
            }
        }

        return order;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status },
            include: { customer: { include: { user: true } }, supplier: true, address: true }
        }) as any;

        const phone = order.guestPhone || order.customer?.phone;

        if (status === 'IN_PREPARATION' && phone) {
            await this.notificationsQueue.add('sms', {
                phone,
                message: `Your order is being prepared by ${order.supplier?.name || 'the butcher'}.`
            });
        }

        if (status === 'READY_FOR_PICKUP') {
            const s = order.supplier;
            const supplierFullAddress = s ? [s.addressLine1, s.addressLine2, s.city, s.area, s.postcode].filter(Boolean).join(', ') : 'Platform Default Address';
            
            const addr = order.address;
            const customerFullAddress = addr ? [addr.line1, addr.line2, addr.postcodeCode].filter(Boolean).join(', ') : 'See Order Details';

            await this.deliveriesQueue.add('create-task', {
                internalDbId: order.id,
                customerPhone: phone || '',
                taskData: {
                    orderId: order.orderNumber,
                    supplierName: order.supplier?.name || 'TEZA Supplier',
                    supplierPhone: order.supplier?.phone || '+447000000000',
                    supplierAddress: supplierFullAddress,
                    customerName: order.guestEmail ? 'Guest' : (order.customer?.firstName || 'Customer'),
                    customerPhone: phone || '',
                    customerAddress: customerFullAddress,
                    price: Number(order.totalAmount),
                    customerEmail: order.guestEmail || order.customer?.user?.email || ''
                }
            });
        }

        if (status === 'DELIVERED' && phone) {
            await this.notificationsQueue.add('sms', {
                phone,
                message: `Your TEZA order has been delivered. Enjoy!`
            });
        }

        return order;
    }

    async flagIssue(id: string): Promise<Order> {
        return this.prisma.order.update({
            where: { id },
            data: { status: 'ISSUE_FLAGGED' }
        });
    }

    async linkOrderToCustomer(orderId: string, customerId: string): Promise<void> {
        await this.prisma.order.update({
            where: { id: orderId },
            data: { 
                customer: { connect: { id: customerId } },
                guestEmail: null,
                guestPhone: null
            }
        });
    }

    async getSupplierSuggestions(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { address: true }
        });

        if (!order) throw new BadRequestException('Order not found');

        const customerOutcode = order.address.postcodeCode; // Already stored as outcode prefix
        const suppliers = await this.prisma.supplier.findMany({
            where: { status: 'ACTIVE' }
        });

        const suggestions = suppliers.map(s => {
            const supplierOutcode = extractOutcode(s.postcode || s.address);
            const proximityScore = calculateProximityScore(customerOutcode, supplierOutcode);
            return {
                id: s.id,
                name: s.name,
                address: [s.addressLine1, s.city, s.postcode].filter(Boolean).join(', ') || s.address,
                outcode: supplierOutcode,
                score: proximityScore
            };
        });

        // Sort by score descending
        return suggestions.sort((a, b) => b.score - a.score);
    }

    async reassignSupplier(orderId: string, supplierId: string) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: { 
                supplier: { connect: { id: supplierId } }
            },
            include: { supplier: true }
        });
    }
}
