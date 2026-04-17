import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Supplier, SupplierStatus } from '@prisma/client';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Supplier[]>;
    findOne(id: string): Promise<Supplier | null>;
    create(data: Prisma.SupplierCreateInput): Promise<Supplier>;
    updateStatus(id: string, status: SupplierStatus): Promise<Supplier>;
    getPendingApplications(): Promise<({
        supplier: {
            id: string;
            name: string;
            contactName: string;
            phone: string;
            email: string;
            hmcCertNumber: string | null;
            status: import("@prisma/client").$Enums.SupplierStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string;
            addressLine1: string | null;
            addressLine2: string | null;
            area: string | null;
            city: string | null;
            postcode: string | null;
        };
    } & {
        id: string;
        supplierId: string;
        notes: string | null;
        decisionDate: Date | null;
        decidedById: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
    })[]>;
    decideApplication(supplierId: string, decision: 'APPROVED' | 'REJECTED', opsAdminId: string, notes?: string): Promise<{
        id: string;
        name: string;
        contactName: string;
        phone: string;
        email: string;
        hmcCertNumber: string | null;
        status: import("@prisma/client").$Enums.SupplierStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        address: string;
        addressLine1: string | null;
        addressLine2: string | null;
        area: string | null;
        city: string | null;
        postcode: string | null;
    }>;
    getInventory(supplierId: string): Promise<({
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
    })[]>;
}
