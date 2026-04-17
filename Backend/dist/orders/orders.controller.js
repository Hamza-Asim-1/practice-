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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const users_service_1 = require("../users/users.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let OrdersController = class OrdersController {
    ordersService;
    usersService;
    constructor(ordersService, usersService) {
        this.ordersService = ordersService;
        this.usersService = usersService;
    }
    async create(createOrderDto, req) {
        let customerId = req.user.customer?.id;
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
            throw new common_1.ForbiddenException('Authenticated customer profile is required to place an order.');
        }
        return this.ordersService.create(createOrderDto, customerId);
    }
    findAll(req, supplierId) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        if (supplierId) {
            return this.ordersService.findSupplierOrders(supplierId);
        }
        return this.ordersService.findAll();
    }
    findMyOrders(req) {
        if (req.user.role !== 'CUSTOMER') {
            throw new common_1.ForbiddenException('Only customers can view their order history here');
        }
        const customerId = req.user.customer?.id;
        return this.ordersService.findMyOrders(customerId);
    }
    findSupplierOrders(req) {
        if (req.user.role !== 'SUPPLIER_ADMIN' || !req.user.supplierId) {
            throw new common_1.ForbiddenException('Only suppliers can view supplier orders');
        }
        return this.ordersService.findSupplierOrders(req.user.supplierId);
    }
    async findOne(id, req) {
        const order = await this.ordersService.findOne(id);
        if (!order)
            return null;
        const user = req.user;
        if (user.role === 'CUSTOMER') {
            const userCustomerId = user.customer?.id;
            const userEmail = user.email;
            const isOwner = (order.customerId && order.customerId === userCustomerId) ||
                (order.guestEmail && order.guestEmail === userEmail);
            if (!isOwner) {
                console.log(`[RBAC] Denied: Order ${id} (Customer: ${order.customerId}, Guest: ${order.guestEmail}) user ${user.id} (Customer: ${userCustomerId}, Email: ${userEmail})`);
                throw new common_1.ForbiddenException('You do not have access to this order');
            }
            if (!order.customerId && order.guestEmail === userEmail && userCustomerId) {
                await this.ordersService.linkOrderToCustomer(order.id, userCustomerId);
            }
        }
        else if (user.role === 'SUPPLIER_ADMIN') {
            if (order.supplierId !== user.supplierId)
                throw new common_1.ForbiddenException('You do not have access to this order');
        }
        return order;
    }
    async updateStatus(id, status, req) {
        const order = await this.ordersService.findOne(id);
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const user = req.user;
        if (user.role === 'CUSTOMER')
            throw new common_1.ForbiddenException();
        if (user.role === 'SUPPLIER_ADMIN') {
            const userSupplierId = user.supplierId;
            if (order.supplierId !== userSupplierId) {
                throw new common_1.ForbiddenException('You can only update your own orders');
            }
        }
        return this.ordersService.updateStatus(id, status);
    }
    async flagIssue(id, req) {
        const order = await this.ordersService.findOne(id);
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const user = req.user;
        if (user.role === 'CUSTOMER')
            throw new common_1.ForbiddenException();
        if (user.role === 'SUPPLIER_ADMIN') {
            const userSupplierId = user.supplierId;
            if (order.supplierId !== userSupplierId) {
                throw new common_1.ForbiddenException('You can only flag issues on your own orders');
            }
        }
        return this.ordersService.flagIssue(id);
    }
    async getSuggestions(id, req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.ordersService.getSupplierSuggestions(id);
    }
    async reassignSupplier(id, supplierId, req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.ordersService.reassignSupplier(id, supplierId);
    }
    async syncPayment(id, req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.ordersService.syncPaymentStatus(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findMyOrders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('supplier'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findSupplierOrders", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/issue'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "flagIssue", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/suggestions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/assign-supplier'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('supplierId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "reassignSupplier", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/sync-payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "syncPayment", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        users_service_1.UsersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map