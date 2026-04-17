import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body('name') name: string, @Request() req) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
      throw new ForbiddenException('Only admins can create categories');
    }
    return this.categoriesService.create(name);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string, @Request() req) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
      throw new ForbiddenException('Only admins can update categories');
    }
    return this.categoriesService.update(id, name);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPS_ADMIN') {
      throw new ForbiddenException('Only admins can delete categories');
    }
    return this.categoriesService.remove(id);
  }
}
