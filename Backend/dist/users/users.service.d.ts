import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.UserCreateInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findSupplierApplications(): Promise<{
        id: string;
        supplierId: string;
        email: string;
        firstName: string;
        lastName: string;
        businessName: string;
        phone: string;
        role: import("@prisma/client").$Enums.Role;
        supplierStatus: import("@prisma/client").$Enums.SupplierStatus;
        hmcCertNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateSupplierStatus(userId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'): Promise<{
        success: boolean;
        message: string;
        id: string;
        email: string;
        supplierStatus: import("@prisma/client").$Enums.SupplierStatus;
    }>;
    approveSupplier(userId: string, isApproved: boolean): Promise<{
        success: boolean;
        message: string;
        status: string;
    }>;
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    createCustomer(data: {
        userId: string;
        firstName: string;
        lastName: string;
        phone: string;
    }): Promise<{
        id: string;
        userId: string | null;
        firstName: string;
        lastName: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    createSupplier(data: {
        userId: string;
        email: string;
        name: string;
        contactName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        area: string;
        postcode: string;
        hmcCertNumber?: string;
    }): Promise<{
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
    adminCreateSupplier(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        area: string;
        postcode: string;
        businessName: string;
        hmcCertNumber?: string;
    }): Promise<{
        success: boolean;
        message: string;
        userId: string;
        supplierId: string;
        email: string;
        businessName: string;
        status: import("@prisma/client").$Enums.SupplierStatus;
    }>;
}
