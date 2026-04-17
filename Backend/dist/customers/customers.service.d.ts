import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Customer, Address } from '@prisma/client';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Customer[]>;
    findOne(id: string): Promise<Customer | null>;
    update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer>;
    addAddress(customerId: string, data: Prisma.AddressCreateWithoutCustomerInput): Promise<Address>;
    getAddresses(customerId: string): Promise<Address[]>;
}
