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
exports.SuppliersController = void 0;
const common_1 = require("@nestjs/common");
const suppliers_service_1 = require("./suppliers.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SuppliersController = class SuppliersController {
    suppliersService;
    constructor(suppliersService) {
        this.suppliersService = suppliersService;
    }
    findAll(req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Admin access required');
        }
        return this.suppliersService.findAll();
    }
    getInventory(req) {
        if (!req.user.supplierId) {
            throw new common_1.ForbiddenException('Supplier account required');
        }
        return this.suppliersService.getInventory(req.user.supplierId);
    }
    getApplications(req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Admin access required to view applications');
        }
        return this.suppliersService.getPendingApplications();
    }
    findOne(id, req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.supplierId !== id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.suppliersService.findOne(id);
    }
    decideApplication(id, decision, notes, req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Admin access required to decide applications');
        }
        return this.suppliersService.decideApplication(id, decision, req.user.id, notes);
    }
    create(createSupplierDto, req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only Admins can onboard suppliers manually');
        }
        return this.suppliersService.create(createSupplierDto);
    }
    updateStatus(id, status, req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only Admins can update supplier status');
        }
        return this.suppliersService.updateStatus(id, status);
    }
};
exports.SuppliersController = SuppliersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('inventory'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "getInventory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "getApplications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('applications/:id/decide'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('decision')),
    __param(2, (0, common_1.Body)('notes')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "decideApplication", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "updateStatus", null);
exports.SuppliersController = SuppliersController = __decorate([
    (0, common_1.Controller)('suppliers'),
    __metadata("design:paramtypes", [suppliers_service_1.SuppliersService])
], SuppliersController);
//# sourceMappingURL=suppliers.controller.js.map