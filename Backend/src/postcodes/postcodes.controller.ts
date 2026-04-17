import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, NotFoundException, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PostcodesService } from './postcodes.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('postcodes')
export class PostcodesController {
    constructor(private readonly postcodesService: PostcodesService) { }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(60 * 60 * 1000) // 1 hour cache for postcode checks as they change rarely
    @Get('check/:code')
    async checkCoverage(@Param('code') code: string) {
        const postcode = await this.postcodesService.checkRoute(code);
        if (!postcode) {
            throw new NotFoundException('Delivery is not currently available in this area.');
        }
        // Return the postcode object. The frontend can check if postcode.active is true
        return postcode;
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.postcodesService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createPostcodeDto: Prisma.PostcodeCreateInput, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.postcodesService.create(createPostcodeDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':code')
    update(@Param('code') code: string, @Body() updatePostcodeDto: Prisma.PostcodeUpdateInput, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.postcodesService.update(code, updatePostcodeDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':code')
    remove(@Param('code') code: string, @Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return this.postcodesService.remove(code);
    }
}
