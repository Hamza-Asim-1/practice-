import { Controller, Post, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/users')
export class AdminController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':id/approve-supplier')
    async approveSupplier(
        @Param('id') id: string,
        @Body('isApproved') isApproved: boolean,
        @Request() req
    ) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.approveSupplier(id, isApproved);
    }

    @UseGuards(JwtAuthGuard)
    @Post('create-supplier')
    async createSupplier(
        @Body() dto: {
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
        },
        @Request() req
    ) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.adminCreateSupplier(dto);
    }
}
