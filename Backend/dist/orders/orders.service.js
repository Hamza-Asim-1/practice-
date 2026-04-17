"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const stripe_service_1 = require("../stripe/stripe.service");
const twilio_service_1 = require("../twilio/twilio.service");
const tookan_service_1 = require("../tookan/tookan.service");
const postcode_util_1 = require("../common/utils/postcode.util");
const postcodes_service_1 = require("../postcodes/postcodes.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let OrdersService = class OrdersService {
    prisma;
    stripe;
    twilio;
    tookan;
    postcodesService;
    notificationsQueue;
    deliveriesQueue;
    constructor(prisma, stripe, twilio, tookan, postcodesService, notificationsQueue, deliveriesQueue) {
        this.prisma = prisma;
        this.stripe = stripe;
        this.twilio = twilio;
        this.tookan = tookan;
        this.postcodesService = postcodesService;
        this.notificationsQueue = notificationsQueue;
        this.deliveriesQueue = deliveriesQueue;
    }
    async create(data, customerId) {
        let subtotal = 0;
        let complexCount = 0;
        let complexityFlag = false;
        const items = data.items?.create;
        if (Array.isArray(items)) {
            for (const item of items) {
                let customCost = 0;
                if (item.weight === '2kg' || item.weight === '1.5kg')
                    customCost += 3;
                if (item.fatPreference === 'No Fat')
                    customCost += 1;
                if (item.packingStyle === 'Individually Packed')
                    customCost += 2;
                const itemPrice = Number(item.priceAtTime || 0) + customCost;
                let itemComplexities = 0;
                if (item.cutType && item.cutType !== 'Standard')
                    itemComplexities++;
                if (item.fatPreference && item.fatPreference !== 'Standard')
                    itemComplexities++;
                if (item.bonePreference && item.bonePreference !== 'Bone In')
                    itemComplexities++;
                if (item.packingStyle && item.packingStyle !== 'Single Pack')
                    itemComplexities++;
                if (item.specialNotes && item.specialNotes.length > 10)
                    itemComplexities++;
                if (item.texture || item.grind)
                    itemComplexities += 2;
                complexCount += itemComplexities;
                item.priceAtTime = itemPrice;
                subtotal += (itemPrice * (item.quantity || 1));
            }
        }
        if (complexCount >= 3)
            complexityFlag = true;
        if (Array.isArray(items)) {
            for (const item of items) {
                const anyItem = item;
                const productId = anyItem.productId || anyItem.product?.connect?.id;
                if (!productId) {
                    throw new common_1.BadRequestException('Product ID is missing from one of the order items.');
                }
                const product = await this.prisma.product.findUnique({
                    where: { id: productId },
                    include: { stock: true }
                });
                if (!product) {
                    throw new common_1.BadRequestException(`Product ${productId} not found.`);
                }
                if (!product.stock) {
                    await this.prisma.productStock.create({
                        data: { productId, quantity: 999, lowStockThreshold: 5 }
                    });
                }
                else if (Number(product.stock.quantity) < (item.quantity || 1)) {
                    throw new common_1.BadRequestException(`Insufficient stock for ${product.name}. Only ${product.stock.quantity} left.`);
                }
            }
        }
        let postcodeStr = '';
        if (data.address?.create?.postcodeCode) {
            postcodeStr = data.address.create.postcodeCode;
        }
        else if (data.addressId || data.address?.connect?.id) {
            const addrId = data.addressId || data.address?.connect?.id;
            const existingAddress = await this.prisma.address.findUnique({ where: { id: addrId } });
            if (existingAddress)
                postcodeStr = existingAddress.postcodeCode;
        }
        let supplierId = data.supplierId || data.supplier?.connect?.id;
        if (!supplierId && postcodeStr) {
            const basePostcode = postcodeStr.split(' ')[0].toUpperCase();
            const activeSuppliers = await this.prisma.supplier.findMany({
                where: { status: 'ACTIVE' },
                include: { coverage: true }
            });
            const scored = activeSuppliers.map(s => {
                const sOutcode = (0, postcode_util_1.extractOutcode)(s.postcode || s.address);
                const pScore = (0, postcode_util_1.calculateProximityScore)(basePostcode, sOutcode);
                const covers = s.coverage.some(p => p.postcodeId === basePostcode);
                const finalScore = pScore + (covers ? 100 : 0);
                return { id: s.id, finalScore };
            });
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
            const validPostcode = await this.prisma.postcode.findFirst({
                where: { code: basePostcode, active: true }
            });
            if (!validPostcode) {
                console.warn(`[Orders] Delivery postcode ${basePostcode} is not in the recognized coverage list. Proceeding anyway per Admin bypass.`);
            }
            const coverage = await this.prisma.supplierPostcode.findFirst({
                where: {
                    supplierId,
                    postcodeId: basePostcode
                }
            });
            if (!coverage && validPostcode) {
                console.log(`[Orders] Warning: Supplier ${supplierId} does not officially cover ${basePostcode}, but proceeding anyway.`);
            }
        }
        let deliveryFee = 3.99;
        const addressPayloadForFee = data.address;
        const newPostcodeStr = addressPayloadForFee?.create?.postcode || addressPayloadForFee?.create?.postcodeCode;
        if (newPostcodeStr) {
            postcodeStr = newPostcodeStr;
        }
        if (postcodeStr) {
            const outcodeForFee = postcodeStr.split(' ')[0].toUpperCase();
            const areaInfo = await this.postcodesService.checkRoute(outcodeForFee);
            if (areaInfo && areaInfo.deliveryFee) {
                deliveryFee = Number(areaInfo.deliveryFee);
            }
        }
        const totalAmount = subtotal + deliveryFee;
        const createdOrder = await this.prisma.$transaction(async (tx) => {
            let addressPayload = data.address;
            if (addressPayload?.create) {
                const rawPostcode = addressPayload.create.postcode || addressPayload.create.postcodeCode || '';
                const normalizedCode = rawPostcode.split(' ')[0].toUpperCase() || 'UNKNOWN';
                await tx.postcode.upsert({
                    where: { code: normalizedCode },
                    update: {},
                    create: { code: normalizedCode, active: false, deliveryFee: 3.99 },
                });
                const { postcode: _drop, postcodeCode: _drop2, ...restAddress } = addressPayload.create;
                addressPayload = {
                    create: {
                        ...restAddress,
                        postcodeCode: normalizedCode,
                    },
                };
            }
            const orderId = `TEZA-${Date.now()}`;
            const { customer, address: _oldAddress, supplier, ...rest } = data;
            const orderData = {
                ...rest,
                orderNumber: orderId,
                subtotal,
                totalAmount,
                customer: customerId ? { connect: { id: customerId } } : undefined,
                complexityFlag,
                status: client_1.OrderStatus.PENDING_PAYMENT,
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
            if (Array.isArray(items)) {
                for (const item of items) {
                    const anyItem = item;
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
            timeout: 15000
        });
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
                method: 'card',
            }
        });
        return {
            ...createdOrder,
            clientSecret: paymentIntent.client_secret,
        };
    }
    async confirmOrder(orderId) {
        console.log(`--- 🔄 Confirming Order: ${orderId} ---`);
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: client_1.OrderStatus.CONFIRMED,
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
        const phone = order.guestPhone || order.customer?.phone;
        if (phone) {
            await this.notificationsQueue.add('sms', {
                phone,
                message: `Your TEZA order ${order.orderNumber} is confirmed. Est: ${order.complexityFlag ? '60 mins' : '45 mins'}.`
            });
        }
        return order;
    }
    async findAll() {
        return this.prisma.order.findMany({
            include: { items: true, customer: true, supplier: true }
        });
    }
    async findMyOrders(customerId) {
        if (!customerId)
            return [];
        return this.prisma.order.findMany({
            where: { customerId },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findSupplierOrders(supplierId) {
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
    async syncPaymentStatus(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });
        if (!order) {
            throw new common_1.BadRequestException('Order not found');
        }
        const payment = order.payment;
        if (!payment?.stripePaymentId) {
            throw new common_1.BadRequestException('No Stripe payment found for this order');
        }
        const paymentIntent = await this.stripe.retrievePaymentIntent(payment.stripePaymentId);
        if (paymentIntent.status === 'succeeded') {
            return this.confirmOrder(orderId);
        }
        return this.findOne(orderId);
    }
    async findOne(id) {
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
        if (!order)
            return null;
        const payment = order.payment;
        if (payment?.stripePaymentId) {
            try {
                const intent = await this.stripe.retrievePaymentIntent(payment.stripePaymentId);
                return {
                    ...order,
                    stripeStatus: intent.status,
                    stripeAmountReceived: intent.amount_received,
                    stripeCurrency: intent.currency
                };
            }
            catch (e) {
                console.error('Stripe retrieval failed', e);
            }
        }
        return order;
    }
    async updateStatus(id, status) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status },
            include: { customer: { include: { user: true } }, supplier: true, address: true }
        });
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
    async flagIssue(id) {
        return this.prisma.order.update({
            where: { id },
            data: { status: 'ISSUE_FLAGGED' }
        });
    }
    async linkOrderToCustomer(orderId, customerId) {
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                customer: { connect: { id: customerId } },
                guestEmail: null,
                guestPhone: null
            }
        });
    }
    async getSupplierSuggestions(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { address: true }
        });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const customerOutcode = order.address.postcodeCode;
        const suppliers = await this.prisma.supplier.findMany({
            where: { status: 'ACTIVE' }
        });
        const suggestions = suppliers.map(s => {
            const supplierOutcode = (0, postcode_util_1.extractOutcode)(s.postcode || s.address);
            const proximityScore = (0, postcode_util_1.calculateProximityScore)(customerOutcode, supplierOutcode);
            return {
                id: s.id,
                name: s.name,
                address: [s.addressLine1, s.city, s.postcode].filter(Boolean).join(', ') || s.address,
                outcode: supplierOutcode,
                score: proximityScore
            };
        });
        return suggestions.sort((a, b) => b.score - a.score);
    }
    async reassignSupplier(orderId, supplierId) {
        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                supplier: { connect: { id: supplierId } }
            },
            include: { supplier: true }
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, bullmq_1.InjectQueue)('notifications')),
    __param(6, (0, bullmq_1.InjectQueue)('deliveries')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        twilio_service_1.TwilioService,
        tookan_service_1.TookanService,
        postcodes_service_1.PostcodesService,
        bullmq_2.Queue,
        bullmq_2.Queue])
], OrdersService);
//# sourceMappingURL=orders.service.js.map