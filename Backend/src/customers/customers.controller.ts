import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.customersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        // Only admins or the customer themselves can view
        const userId = req.user.id;
        const customerId = req.user.customer?.id;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && userId !== id && customerId !== id) {
            throw new ForbiddenException('Access denied');
        }
        return this.customersService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCustomerDto: Prisma.CustomerUpdateInput, @Request() req) {
        const userId = req.user.id;
        const customerId = req.user.customer?.id;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && userId !== id && customerId !== id) {
            throw new ForbiddenException('Access denied');
        }
        return this.customersService.update(id, updateCustomerDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/addresses')
    addAddress(@Param('id') id: string, @Body() addAddressDto: Prisma.AddressCreateWithoutCustomerInput, @Request() req) {
        const userId = req.user.id;
        const customerId = req.user.customer?.id;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && userId !== id && customerId !== id) {
            throw new ForbiddenException('Access denied');
        }
        return this.customersService.addAddress(id, addAddressDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/addresses')
    getAddresses(@Param('id') id: string, @Request() req) {
        const userId = req.user.id;
        const customerId = req.user.customer?.id;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && userId !== id && customerId !== id) {
            throw new ForbiddenException('Access denied');
        }
        return this.customersService.getAddresses(id);
    }
}
