import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string) {
    try {
      return await this.prisma.category.create({
        data: { name },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async update(id: string, name: string) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: { name },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
