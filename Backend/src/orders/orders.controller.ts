import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException, BadRequestException, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UsersService } from '../users/users.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly usersService: UsersService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createOrderDto: Prisma.OrderCreateInput, @Request() req) {
        let customerId = req.user.customer?.id;
        
        // Lazy creation for users registered before the migration
        if (!customerId && req.user.role === 'CUSTOMER') {
            const customer = await this.usersService.createCustomer({
                userId: req.user.id,
                firstName: '',
                lastName: '',
                phone: '',
            });
            customerId = customer.id;
        }

        if (!customerId) {
            throw new ForbiddenException('Authenticated customer profile is required to place an order.');
        }

        return this.ordersService.create(createOrderDto, customerId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req, @Query('supplierId') supplierId?: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        if (supplierId) {
            return this.ordersService.findSupplierOrders(supplierId);
        }
        return this.ordersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('mine')
    findMyOrders(@Request() req) {
        if (req.user.role !== 'CUSTOMER') {
            throw new ForbiddenException('Only customers can view their order history here');
        }
        // Use user.customer.id if available, or fall back to searching by userId
        const customerId = req.user.customer?.id;
        return this.ordersService.findMyOrders(customerId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('supplier')
    findSupplierOrders(@Request() req) {
        if (req.user.role !== 'SUPPLIER_ADMIN' || !req.user.supplierId) {
            throw new ForbiddenException('Only suppliers can view supplier orders');
        }
        return this.ordersService.findSupplierOrders(req.user.supplierId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        const order = await this.ordersService.findOne(id);
        if (!order) return null;

        // RBAC: customers see own, suppliers see own, admins see all
        const user = req.user;
        if (user.role === 'CUSTOMER') {
            const userCustomerId = user.customer?.id;
            const userEmail = user.email;
            
            const isOwner = (order.customerId && order.customerId === userCustomerId) || 
                            (order.guestEmail && order.guestEmail === userEmail);

            if (!isOwner) {
                console.log(`[RBAC] Denied: Order ${id} (Customer: ${order.customerId}, Guest: ${order.guestEmail}) user ${user.id} (Customer: ${userCustomerId}, Email: ${userEmail})`);
                throw new ForbiddenException('You do not have access to this order');
            }

            // Migration: link guest order to authenticated customer profile
            if (!order.customerId && order.guestEmail === userEmail && userCustomerId) {
                await this.ordersService.linkOrderToCustomer(order.id, userCustomerId);
            }
        } else if (user.role === 'SUPPLIER_ADMIN') {
            if (order.supplierId !== user.supplierId) throw new ForbiddenException('You do not have access to this order');
        }

        return order;
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus, @Request() req) {
        const order = await this.ordersService.findOne(id);
        if (!order) throw new BadRequestException('Order not found');

        // RBAC: Admins can update any; Suppliers only their own; Customers never
        const user = req.user;
        if (user.role === 'CUSTOMER') throw new ForbiddenException();
        if (user.role === 'SUPPLIER_ADMIN') {
            const userSupplierId = user.supplierId;
            if (order.supplierId !== userSupplierId) {
                throw new ForbiddenException('You can only update your own orders');
            }
        }

        return this.ordersService.updateStatus(id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/issue')
    async flagIssue(@Param('id') id: string, @Request() req) {
        const order = await this.ordersService.findOne(id);
        if (!order) throw new BadRequestException('Order not found');

        const user = req.user;
        if (user.role === 'CUSTOMER') throw new ForbiddenException();
        if (user.role === 'SUPPLIER_ADMIN') {
            const userSupplierId = user.supplierId;
            if (order.supplierId !== userSupplierId) {
                throw new ForbiddenException('You can only flag issues on your own orders');
            }
        }

        return this.ordersService.flagIssue(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/suggestions')
    async getSuggestions(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.ordersService.getSupplierSuggestions(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/assign-supplier')
    async reassignSupplier(@Param('id') id: string, @Body('supplierId') supplierId: string, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.ordersService.reassignSupplier(id, supplierId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/sync-payment')
    async syncPayment(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.ordersService.syncPaymentStatus(id);
    }
}
