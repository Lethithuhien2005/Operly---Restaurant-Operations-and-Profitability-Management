import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    });
    if (existing) {
      throw new ConflictException(
        `A category named "${dto.name}" already exists`,
      );
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(isActive?: boolean) {
    return this.prisma.category.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        menuItems: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { menuItems: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" was not found`);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name: { equals: dto.name, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Another category with name "${dto.name}" already exists`,
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    if (category._count.menuItems > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}": It contains ${category._count.menuItems} dish(es). Reassign or delete dishes first.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
