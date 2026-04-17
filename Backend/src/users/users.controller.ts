import { Controller, Get, Param, UseGuards, Patch, Delete, Body, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('suppliers/applications')
    async findSupplierApplications(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.findSupplierApplications();
    }

    @UseGuards(JwtAuthGuard)
    @Patch('suppliers/:id/status')
    async updateSupplierStatus(
        @Param('id') id: string,
        @Body('status') status: 'ACTIVE' | 'PENDING' | 'SUSPENDED',
        @Request() req
    ) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.updateSupplierStatus(id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.findById(id);
    }

    // NOTE: Patch and Delete should be restricted to SUPER_ADMIN.
    // We can add more advanced role guards later.
}
