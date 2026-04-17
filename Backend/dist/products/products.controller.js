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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const cache_manager_1 = require("@nestjs/cache-manager");
const products_service_1 = require("./products.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    findAll(category, categoryId, page = '1', limit = '9', all) {
        const p = parseInt(page, 10) || 1;
        const l = parseInt(limit, 10) || 9;
        const skip = (p - 1) * l;
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        else if (category)
            where.category = category;
        if (all !== 'true') {
            where.approvalStatus = 'APPROVED';
        }
        return this.productsService.findAll({
            where,
            skip,
            take: l,
            orderBy: { createdAt: 'desc' }
        });
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    async create(file, body, req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can create products');
        }
        const createProductDto = {
            ...body,
            basePrice: Number(body.basePrice),
            isHmcCertified: body.isHmcCertified === 'true' || body.isHmcCertified === true,
            isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
            specifications: typeof body.specifications === 'string' ? JSON.parse(body.specifications) : body.specifications,
            stock: typeof body.stock === 'string' ? JSON.parse(body.stock) : {
                quantity: Number(body.quantity || 0),
                lowStockThreshold: Number(body.lowStockThreshold || 5)
            }
        };
        return this.productsService.create(createProductDto, file);
    }
    async update(id, file, body, req) {
        const product = await this.productsService.findOne(id);
        if (!product)
            throw new common_1.BadRequestException('Product not found');
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can update products');
        }
        if (body.approvalStatus) {
            if (body.approvalStatus === 'APPROVED')
                return this.productsService.approve(id);
            if (body.approvalStatus === 'REJECTED')
                return this.productsService.reject(id);
        }
        const updateProductDto = {
            ...body,
            ...(body.basePrice !== undefined && { basePrice: Number(body.basePrice) }),
            ...(body.isHmcCertified !== undefined && { isHmcCertified: (body.isHmcCertified === 'true' || body.isHmcCertified === true) }),
            ...(body.isFeatured !== undefined && { isFeatured: (body.isFeatured === 'true' || body.isFeatured === true) }),
            ...(body.specifications !== undefined && { specifications: typeof body.specifications === 'string' ? JSON.parse(body.specifications) : body.specifications }),
            ...((body.quantity !== undefined || body.lowStockThreshold !== undefined || body.stock !== undefined) && {
                stock: typeof body.stock === 'string' ? JSON.parse(body.stock) : {
                    quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
                    lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : undefined
                }
            })
        };
        return this.productsService.update(id, updateProductDto, file);
    }
    async approve(id, req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only admins can approve products');
        }
        return this.productsService.approve(id);
    }
    async reject(id, req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only admins can reject products');
        }
        return this.productsService.reject(id);
    }
    async updateStock(id, quantity, lowStockThreshold, req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can update stock directly');
        }
        const product = await this.productsService.findOne(id);
        if (!product)
            throw new common_1.BadRequestException('Product not found');
        return this.productsService.updateStock(id, quantity, lowStockThreshold);
    }
    async remove(id, req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can remove products');
        }
        const product = await this.productsService.findOne(id);
        if (!product)
            throw new common_1.BadRequestException('Product not found');
        return this.productsService.remove(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(15 * 60 * 1000),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('all')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(15 * 60 * 1000),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
        ],
        fileIsRequired: false,
    }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
        ],
        fileIsRequired: false,
    }))),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "approve", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "reject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/stock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('quantity')),
    __param(2, (0, common_1.Body)('lowStockThreshold')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateStock", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map