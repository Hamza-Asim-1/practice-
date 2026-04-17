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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
let ProductsService = class ProductsService {
    prisma;
    cacheManager;
    cloudinary;
    constructor(prisma, cacheManager, cloudinary) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
        this.cloudinary = cloudinary;
    }
    async findAll(params) {
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                ...params,
                where: {
                    ...params.where,
                    deletedAt: null
                },
                include: {
                    stock: true,
                    categoryObj: true
                }
            }),
            this.prisma.product.count({
                where: {
                    ...params.where,
                    deletedAt: null
                }
            })
        ]);
        return { data, total };
    }
    async findOne(id) {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                stock: true,
                categoryObj: true
            }
        });
    }
    async create(data, file) {
        let imageUrl = data.imageUrl;
        if (file) {
            const upload = await this.cloudinary.uploadFile(file).catch(err => {
                throw new common_1.BadRequestException(`Asset Binary Synchronization Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }
        else if (data.imageUrl && data.imageUrl.startsWith('http') && !data.imageUrl.includes('cloudinary.com')) {
            const upload = await this.cloudinary.uploadFromUrl(data.imageUrl).catch(err => {
                throw new common_1.BadRequestException(`Asset URL Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }
        const product = await this.prisma.product.create({
            data: {
                name: data.name,
                categoryId: data.categoryId,
                category: data.category,
                basePrice: data.basePrice,
                description: data.description,
                imageUrl: imageUrl,
                isHmcCertified: data.isHmcCertified,
                specifications: data.specifications,
                approvalStatus: 'APPROVED',
                stock: {
                    create: {
                        quantity: data.stock?.quantity || 0,
                        lowStockThreshold: data.stock?.lowStockThreshold || 5
                    }
                }
            },
            include: { stock: true, categoryObj: true }
        });
        try {
            if (typeof this.cacheManager.store?.reset === 'function') {
                await this.cacheManager.store.reset();
            }
            else if (typeof this.cacheManager.reset === 'function') {
                await this.cacheManager.reset();
            }
            else if (typeof this.cacheManager.clear === 'function') {
                await this.cacheManager.clear();
            }
        }
        catch (e) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Registration proceeding):', e.message);
        }
        return product;
    }
    async update(id, data, file) {
        let imageUrl = data.imageUrl;
        if (file) {
            const upload = await this.cloudinary.uploadFile(file).catch(err => {
                throw new common_1.BadRequestException(`Modification Artifact Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }
        else if (data.imageUrl && data.imageUrl.startsWith('http') && !data.imageUrl.includes('cloudinary.com')) {
            const upload = await this.cloudinary.uploadFromUrl(data.imageUrl).catch(err => {
                throw new common_1.BadRequestException(`External Asset Migration Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }
        const { quantity, lowStockThreshold, stock, id: _, createdAt: __, updatedAt: ___, ...rest } = data;
        const updateData = {
            ...rest,
            ...(imageUrl && { imageUrl }),
            ...(data.specifications !== undefined && { specifications: data.specifications }),
            ...(stock && {
                stock: {
                    upsert: {
                        create: {
                            quantity: stock.quantity || 0,
                            lowStockThreshold: stock.lowStockThreshold || 5
                        },
                        update: {
                            ...(stock.quantity !== undefined && { quantity: stock.quantity }),
                            ...(stock.lowStockThreshold !== undefined && { lowStockThreshold: stock.lowStockThreshold })
                        }
                    }
                }
            })
        };
        const product = await this.prisma.product.update({
            where: { id },
            data: updateData,
            include: { stock: true, categoryObj: true }
        });
        try {
            if (typeof this.cacheManager.store?.reset === 'function') {
                await this.cacheManager.store.reset();
            }
            else if (typeof this.cacheManager.reset === 'function') {
                await this.cacheManager.reset();
            }
            else if (typeof this.cacheManager.clear === 'function') {
                await this.cacheManager.clear();
            }
        }
        catch (e) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Modification proceeding):', e.message);
        }
        return product;
    }
    async stageUpdate(id, data, file) {
        let imageUrl = data.imageUrl;
        if (file) {
            const upload = await this.cloudinary.uploadFile(file).catch(err => {
                throw new common_1.BadRequestException(`Draft Asset Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }
        else if (data.imageUrl && data.imageUrl.startsWith('http') && !data.imageUrl.includes('cloudinary.com')) {
            const upload = await this.cloudinary.uploadFromUrl(data.imageUrl).catch(err => {
                throw new common_1.BadRequestException(`Draft URL Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }
        const draftData = {
            ...data,
            ...(imageUrl && { imageUrl }),
        };
        return this.prisma.product.update({
            where: { id },
            data: {
                draftData: draftData
            },
            include: { stock: true }
        });
    }
    async approve(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { stock: true }
        });
        if (!product)
            throw new common_1.NotFoundException(`Approval failed: Product with ID "${id}" was not found.`);
        if (product.draftData) {
            const draft = product.draftData;
            const { id: _id, createdAt: _ca, updatedAt: _ua, deletedAt: _da, approvalStatus: _as, draftData: _dd, stock, ...mainData } = draft;
            const updated = await this.prisma.product.update({
                where: { id },
                data: {
                    ...mainData,
                    draftData: client_1.Prisma.JsonNull,
                    approvalStatus: 'APPROVED',
                    ...(stock && {
                        stock: {
                            upsert: {
                                create: {
                                    quantity: stock.quantity || 0,
                                    lowStockThreshold: stock.lowStockThreshold || 5
                                },
                                update: {
                                    ...(stock.quantity !== undefined && { quantity: stock.quantity }),
                                    ...(stock.lowStockThreshold !== undefined && { lowStockThreshold: stock.lowStockThreshold })
                                }
                            }
                        }
                    })
                },
                include: { stock: true }
            });
            try {
                if (typeof this.cacheManager.clear === 'function') {
                    await this.cacheManager.clear();
                }
                else if (typeof this.cacheManager.reset === 'function') {
                    await this.cacheManager.reset();
                }
            }
            catch (e) {
                console.warn('[ProductsService] Redis Cache Reset Failed (Approval proceeding):', e.message);
            }
            return updated;
        }
        const approved = await this.prisma.product.update({
            where: { id },
            data: { approvalStatus: 'APPROVED' },
            include: { stock: true }
        });
        try {
            if (typeof this.cacheManager.store?.reset === 'function') {
                await this.cacheManager.store.reset();
            }
            else if (typeof this.cacheManager.reset === 'function') {
                await this.cacheManager.reset();
            }
            else if (typeof this.cacheManager.clear === 'function') {
                await this.cacheManager.clear();
            }
        }
        catch (e) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Approval proceeding):', e.message);
        }
        return approved;
    }
    async reject(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException(`Rejection failed: Product with ID "${id}" was not found.`);
        if (product.draftData) {
            return this.prisma.product.update({
                where: { id },
                data: { draftData: client_1.Prisma.JsonNull },
                include: { stock: true }
            });
        }
        return this.prisma.product.update({
            where: { id },
            data: { approvalStatus: 'REJECTED' },
            include: { stock: true }
        });
    }
    async updateStock(productId, quantity, lowStockThreshold) {
        const stock = await this.prisma.productStock.upsert({
            where: { productId },
            create: {
                productId,
                quantity,
                lowStockThreshold: lowStockThreshold ?? 5
            },
            update: {
                quantity,
                ...(lowStockThreshold !== undefined && { lowStockThreshold })
            }
        });
        try {
            if (typeof this.cacheManager.store?.reset === 'function') {
                await this.cacheManager.store.reset();
            }
            else if (typeof this.cacheManager.reset === 'function') {
                await this.cacheManager.reset();
            }
            else if (typeof this.cacheManager.clear === 'function') {
                await this.cacheManager.clear();
            }
        }
        catch (e) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Stock Update proceeding):', e.message);
        }
        return stock;
    }
    async remove(id) {
        const product = await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        try {
            if (typeof this.cacheManager.store?.reset === 'function') {
                await this.cacheManager.store.reset();
            }
            else if (typeof this.cacheManager.reset === 'function') {
                await this.cacheManager.reset();
            }
            else if (typeof this.cacheManager.clear === 'function') {
                await this.cacheManager.clear();
            }
        }
        catch (e) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Removal proceeding):', e.message);
        }
        return product;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, cloudinary_service_1.CloudinaryService])
], ProductsService);
//# sourceMappingURL=products.service.js.map