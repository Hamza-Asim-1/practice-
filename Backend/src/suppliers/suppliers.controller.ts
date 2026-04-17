import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Prisma, SupplierStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.suppliersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('inventory')
    getInventory(@Request() req) {
        if (!req.user.supplierId) {
            throw new ForbiddenException('Supplier account required');
        }
        return this.suppliersService.getInventory(req.user.supplierId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('applications')
    getApplications(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required to view applications');
        }
        return this.suppliersService.getPendingApplications();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.supplierId !== id) {
            throw new ForbiddenException('Access denied');
        }
        return this.suppliersService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('applications/:id/decide')
    decideApplication(
        @Param('id') id: string,
        @Body('decision') decision: 'APPROVED' | 'REJECTED',
        @Body('notes') notes: string,
        @Request() req
    ) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required to decide applications');
        }
        return this.suppliersService.decideApplication(id, decision, req.user.id, notes);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createSupplierDto: Prisma.SupplierCreateInput, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only Admins can onboard suppliers manually');
        }
        return this.suppliersService.create(createSupplierDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: SupplierStatus, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only Admins can update supplier status');
        }
        return this.suppliersService.updateStatus(id, status);
    }
}
