import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private cloudinary: CloudinaryService
    ) { }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ProductWhereInput;
        orderBy?: Prisma.ProductOrderByWithRelationInput;
    }) {
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                ...params,
                where: {
                    ...params.where,
                    deletedAt: null
                },
                include: {
                    stock: true,
                    categoryObj: true // Include category object
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

    async findOne(id: string): Promise<Product | null> {
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                stock: true,
                categoryObj: true
            }
        });
    }

    async create(data: any, file?: Express.Multer.File): Promise<Product> {
        let imageUrl = data.imageUrl;

        if (file) {
            const upload = await this.cloudinary.uploadFile(file).catch(err => {
                throw new BadRequestException(`Asset Binary Synchronization Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        } else if (data.imageUrl && data.imageUrl.startsWith('http') && !data.imageUrl.includes('cloudinary.com')) {
            const upload = await this.cloudinary.uploadFromUrl(data.imageUrl).catch(err => {
                throw new BadRequestException(`Asset URL Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }

        const product = await this.prisma.product.create({
            data: {
                name: data.name,
                categoryId: data.categoryId, // New Category system
                category: data.category,     // Kept for backward compat/enum mapping
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
            if (typeof (this.cacheManager as any).store?.reset === 'function') {
                await (this.cacheManager as any).store.reset();
            } else if (typeof (this.cacheManager as any).reset === 'function') {
                await (this.cacheManager as any).reset();
            } else if (typeof (this.cacheManager as any).clear === 'function') {
                await (this.cacheManager as any).clear();
            }
        } catch (e: any) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Registration proceeding):', e.message);
        }

        return product;
    }

    async update(id: string, data: any, file?: Express.Multer.File): Promise<Product> {
        let imageUrl = data.imageUrl;

        if (file) {
            const upload = await this.cloudinary.uploadFile(file).catch(err => {
                throw new BadRequestException(`Modification Artifact Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        } else if (data.imageUrl && data.imageUrl.startsWith('http') && !data.imageUrl.includes('cloudinary.com')) {
            const upload = await this.cloudinary.uploadFromUrl(data.imageUrl).catch(err => {
                throw new BadRequestException(`External Asset Migration Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }

        // Clean update data to remove stock/status fields which are handled separately
        const { quantity, lowStockThreshold, stock, id: _, createdAt: __, updatedAt: ___, ...rest } = data;

        const updateData: any = {
            ...rest,
            ...(imageUrl && { imageUrl }),
            ...(data.specifications !== undefined && { specifications: data.specifications }),
            // Handle nested stock update if provided
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
            if (typeof (this.cacheManager as any).store?.reset === 'function') {
                await (this.cacheManager as any).store.reset();
            } else if (typeof (this.cacheManager as any).reset === 'function') {
                await (this.cacheManager as any).reset();
            } else if (typeof (this.cacheManager as any).clear === 'function') {
                await (this.cacheManager as any).clear();
            }
        } catch (e: any) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Modification proceeding):', e.message);
        }

        return product;
    }

    async stageUpdate(id: string, data: any, file?: Express.Multer.File): Promise<Product> {
        let imageUrl = data.imageUrl;

        if (file) {
            const upload = await this.cloudinary.uploadFile(file).catch(err => {
                throw new BadRequestException(`Draft Asset Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        } else if (data.imageUrl && data.imageUrl.startsWith('http') && !data.imageUrl.includes('cloudinary.com')) {
            const upload = await this.cloudinary.uploadFromUrl(data.imageUrl).catch(err => {
                throw new BadRequestException(`Draft URL Sync Failed: ${err.message}`);
            });
            imageUrl = upload.secure_url;
        }

        const draftData: any = {
            ...data,
            ...(imageUrl && { imageUrl }),
        };

        return this.prisma.product.update({
            where: { id },
            data: {
                draftData: draftData as any
            } as any,
            include: { stock: true }
        });
    }

    async approve(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { stock: true }
        }) as any;

        if (!product) throw new NotFoundException(`Approval failed: Product with ID "${id}" was not found.`);

        // Case A: Approving staged changes for an existing product
        if (product.draftData) {
            const draft = product.draftData as any;

            // SECURITY: Destructure and only take allowed fields for update.
            // Exclude protected/immutable fields to prevent Prisma runtime errors.
            const {
                id: _id,
                createdAt: _ca,
                updatedAt: _ua,
                deletedAt: _da,
                approvalStatus: _as,
                draftData: _dd,
                stock,
                ...mainData
            } = draft;

            const updated = await this.prisma.product.update({
                where: { id },
                data: {
                    ...mainData,
                    draftData: Prisma.JsonNull,
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
                if (typeof (this.cacheManager as any).clear === 'function') {
                    await (this.cacheManager as any).clear();
                } else if (typeof (this.cacheManager as any).reset === 'function') {
                    await (this.cacheManager as any).reset();
                }
            } catch (e: any) {
                console.warn('[ProductsService] Redis Cache Reset Failed (Approval proceeding):', e.message);
            }

            return updated;
        }

        // Case B: Approving a brand new product
        const approved = await this.prisma.product.update({
            where: { id },
            data: { approvalStatus: 'APPROVED' },
            include: { stock: true }
        });

        try {
            if (typeof (this.cacheManager as any).store?.reset === 'function') {
                await (this.cacheManager as any).store.reset();
            } else if (typeof (this.cacheManager as any).reset === 'function') {
                await (this.cacheManager as any).reset();
            } else if (typeof (this.cacheManager as any).clear === 'function') {
                await (this.cacheManager as any).clear();
            }
        } catch (e: any) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Approval proceeding):', e.message);
        }

        return approved;
    }

    async reject(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({ where: { id } }) as any;
        if (!product) throw new NotFoundException(`Rejection failed: Product with ID "${id}" was not found.`);

        // If it has draftData, just clear it (revert to live state)
        if (product.draftData) {
            return this.prisma.product.update({
                where: { id },
                data: { draftData: Prisma.JsonNull } as any,
                include: { stock: true }
            });
        }

        // Otherwise reject the product entirely
        return this.prisma.product.update({
            where: { id },
            data: { approvalStatus: 'REJECTED' },
            include: { stock: true }
        });
    }

    async updateStock(productId: string, quantity: number, lowStockThreshold?: number) {
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
            if (typeof (this.cacheManager as any).store?.reset === 'function') {
                await (this.cacheManager as any).store.reset();
            } else if (typeof (this.cacheManager as any).reset === 'function') {
                await (this.cacheManager as any).reset();
            } else if (typeof (this.cacheManager as any).clear === 'function') {
                await (this.cacheManager as any).clear();
            }
        } catch (e: any) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Stock Update proceeding):', e.message);
        }

        return stock;
    }

    async remove(id: string): Promise<Product> {
        const product = await this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        try {
            if (typeof (this.cacheManager as any).store?.reset === 'function') {
                await (this.cacheManager as any).store.reset();
            } else if (typeof (this.cacheManager as any).reset === 'function') {
                await (this.cacheManager as any).reset();
            } else if (typeof (this.cacheManager as any).clear === 'function') {
                await (this.cacheManager as any).clear();
            }
        } catch (e: any) {
            console.warn('[ProductsService] Redis Cache Reset Failed (Removal proceeding):', e.message);
        }

        return product;
    }
}
