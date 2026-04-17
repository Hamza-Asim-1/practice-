import { CustomersService } from './customers.service';
import { Prisma } from '@prisma/client';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(req: any): Promise<{
        id: string;
        userId: string | null;
        firstName: string;
        lastName: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        userId: string | null;
        firstName: string;
        lastName: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null>;
    update(id: string, updateCustomerDto: Prisma.CustomerUpdateInput, req: any): Promise<{
        id: string;
        userId: string | null;
        firstName: string;
        lastName: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    addAddress(id: string, addAddressDto: Prisma.AddressCreateWithoutCustomerInput, req: any): Promise<{
        id: string;
        customerId: string | null;
        line1: string;
        line2: string | null;
        deliveryInstructions: string | null;
        createdAt: Date;
        updatedAt: Date;
        postcodeCode: string;
    }>;
    getAddresses(id: string, req: any): Promise<{
        id: string;
        customerId: string | null;
        line1: string;
        line2: string | null;
        deliveryInstructions: string | null;
        createdAt: Date;
        updatedAt: Date;
        postcodeCode: string;
    }[]>;
}
