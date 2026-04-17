import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Customer, Address } from '@prisma/client';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<Customer[]> {
        return this.prisma.customer.findMany({
            include: {
                user: true,
                orders: true,
            }
        });
    }

    async findOne(id: string): Promise<Customer | null> {
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                user: true,
                orders: true,
                addresses: true,
            }
        });
    }

    async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }

    async addAddress(customerId: string, data: Prisma.AddressCreateWithoutCustomerInput): Promise<Address> {
        return this.prisma.address.create({
            data: {
                ...data,
                customer: { connect: { id: customerId } }
            }
        });
    }

    async getAddresses(customerId: string): Promise<Address[]> {
        return this.prisma.address.findMany({
            where: { customerId }
        });
    }
}
