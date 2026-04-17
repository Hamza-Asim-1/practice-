import { UsersService } from './users.service';
export declare class AdminController {
    private readonly usersService;
    constructor(usersService: UsersService);
    approveSupplier(id: string, isApproved: boolean, req: any): Promise<{
        success: boolean;
        message: string;
        status: string;
    }>;
    createSupplier(dto: {
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
    }, req: any): Promise<{
        success: boolean;
        message: string;
        userId: string;
        supplierId: string;
        email: string;
        businessName: string;
        status: import(".prisma/client").$Enums.SupplierStatus;
    }>;
}
