import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
export declare class ProductsService {
    private prisma;
    private cacheManager;
    private cloudinary;
    constructor(prisma: PrismaService, cacheManager: Cache, cloudinary: CloudinaryService);
    findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ProductWhereInput;
        orderBy?: Prisma.ProductOrderByWithRelationInput;
    }): Promise<{
        data: ({
            categoryObj: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            stock: {
                id: string;
                productId: string;
                quantity: Prisma.Decimal;
                lowStockThreshold: Prisma.Decimal;
                updatedAt: Date;
                createdAt: Date;
            } | null;
        } & {
            id: string;
            category: import("@prisma/client").$Enums.ProductCategory;
            name: string;
            description: string | null;
            basePrice: Prisma.Decimal;
            status: import("@prisma/client").$Enums.ProductStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            imageUrl: string | null;
            isFeatured: boolean;
            isHmcCertified: boolean;
            approvalStatus: import("@prisma/client").$Enums.ProductApprovalStatus;
            categoryId: string | null;
            draftData: Prisma.JsonValue | null;
            specifications: Prisma.JsonValue | null;
        })[];
        total: number;
    }>;
    findOne(id: string): Promise<Product | null>;
    create(data: any, file?: Express.Multer.File): Promise<Product>;
    update(id: string, data: any, file?: Express.Multer.File): Promise<Product>;
    stageUpdate(id: string, data: any, file?: Express.Multer.File): Promise<Product>;
    approve(id: string): Promise<Product>;
    reject(id: string): Promise<Product>;
    updateStock(productId: string, quantity: number, lowStockThreshold?: number): Promise<{
        id: string;
        productId: string;
        quantity: Prisma.Decimal;
        lowStockThreshold: Prisma.Decimal;
        updatedAt: Date;
        createdAt: Date;
    }>;
    remove(id: string): Promise<Product>;
}
