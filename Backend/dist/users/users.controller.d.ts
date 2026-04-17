import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        supplierId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    findSupplierApplications(req: any): Promise<{
        id: string;
        supplierId: string;
        email: string;
        firstName: string;
        lastName: string;
        businessName: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        supplierStatus: import(".prisma/client").$Enums.SupplierStatus;
        hmcCertNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateSupplierStatus(id: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED', req: any): Promise<{
        success: boolean;
        message: string;
        id: string;
        email: string;
        supplierStatus: import(".prisma/client").$Enums.SupplierStatus;
    }>;
    findOne(id: string, req: any): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        supplierId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null>;
}
