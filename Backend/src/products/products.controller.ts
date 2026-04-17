import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ForbiddenException, UseInterceptors, BadRequestException, UploadedFile, ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(15 * 60 * 1000) // 15 minutes cache for catalog
    @Get()
    findAll(
        @Query('category') category?: any,
        @Query('categoryId') categoryId?: string, // Added categoryId support
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '9',
        @Query('all') all?: string,
    ) {
        const p = parseInt(page, 10) || 1;
        const l = parseInt(limit, 10) || 9;
        const skip = (p - 1) * l;
        
        const where: Prisma.ProductWhereInput = {};
        if (categoryId) where.categoryId = categoryId; // Priority to new category system
        else if (category) where.category = category;
        
        // Access Control: Only show APPROVED by default unless 'all' is explicitly requested
        if (all !== 'true') {
            where.approvalStatus = 'APPROVED';
        }

        return this.productsService.findAll({ 
            where,
            skip,
            take: l,
            orderBy: { createdAt: 'desc' }
        });
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(15 * 60 * 1000)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
                ],
                fileIsRequired: false,
            }),
        ) file: Express.Multer.File,
        @Body() body: any,
        @Request() req
    ) {
        const user = req.user;
        
        // RESTRICTION: Only Admin can create products now
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only administrators can create products');
        }

        const createProductDto: any = {
            ...body,
            basePrice: Number(body.basePrice),
            isHmcCertified: body.isHmcCertified === 'true' || body.isHmcCertified === true,
            isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
            specifications: typeof body.specifications === 'string' ? JSON.parse(body.specifications) : body.specifications,
            stock: typeof body.stock === 'string' ? JSON.parse(body.stock) : {
                quantity: Number(body.quantity || 0),
                lowStockThreshold: Number(body.lowStockThreshold || 5)
            }
        };
        
        return this.productsService.create(createProductDto, file);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' }),
                ],
                fileIsRequired: false,
            }),
        ) file: Express.Multer.File,
        @Body() body: any,
        @Request() req
    ) {
        const product = await this.productsService.findOne(id);
        if (!product) throw new BadRequestException('Product not found');

        const user = req.user;

        // RESTRICTION: Only Admin can update products now
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only administrators can update products');
        }

        // Admin Action: Handle approval status directly (check BEFORE processing files)
        if (body.approvalStatus) {
            if (body.approvalStatus === 'APPROVED') return this.productsService.approve(id);
            if (body.approvalStatus === 'REJECTED') return this.productsService.reject(id);
        }

        const updateProductDto: any = {
            ...body,
            ...(body.basePrice !== undefined && { basePrice: Number(body.basePrice) }),
            ...(body.isHmcCertified !== undefined && { isHmcCertified: (body.isHmcCertified === 'true' || body.isHmcCertified === true) }),
            ...(body.isFeatured !== undefined && { isFeatured: (body.isFeatured === 'true' || body.isFeatured === true) }),
            ...(body.specifications !== undefined && { specifications: typeof body.specifications === 'string' ? JSON.parse(body.specifications) : body.specifications }),
            ...( (body.quantity !== undefined || body.lowStockThreshold !== undefined || body.stock !== undefined) && {
                stock: typeof body.stock === 'string' ? JSON.parse(body.stock) : {
                    quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
                    lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : undefined
                }
            })
        };

        return this.productsService.update(id, updateProductDto, file);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/approve')
    async approve(@Param('id') id: string, @Request() req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only admins can approve products');
        }
        return this.productsService.approve(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/reject')
    async reject(@Param('id') id: string, @Request() req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only admins can reject products');
        }
        return this.productsService.reject(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/stock')
    async updateStock(
        @Param('id') id: string,
        @Body('quantity') quantity: number,
        @Body('lowStockThreshold') lowStockThreshold: number,
        @Request() req
    ) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only administrators can update stock directly');
        }

        const product = await this.productsService.findOne(id);
        if (!product) throw new BadRequestException('Product not found');

        return this.productsService.updateStock(id, quantity, lowStockThreshold);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        const user = req.user;
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
            throw new ForbiddenException('Only administrators can remove products');
        }

        const product = await this.productsService.findOne(id);
        if (!product) throw new BadRequestException('Product not found');

        return this.productsService.remove(id);
    }
}
