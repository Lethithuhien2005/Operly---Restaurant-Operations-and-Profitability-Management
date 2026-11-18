import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { DishQueryDto } from './dto/dish-query.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';

@Injectable()
export class DishesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDishDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID "${dto.categoryId}" was not found`,
      );
    }

    return this.prisma.menuItem.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        costPrice: dto.costPrice ?? null,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        isRecommendable: dto.isRecommendable ?? true,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(query: DishQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.isAvailable !== undefined ? { isAvailable: query.isAvailable } : {}),
      ...(query.isRecommendable !== undefined
        ? { isRecommendable: query.isRecommendable }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ category: { displayOrder: 'asc' } }, { name: 'asc' }],
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID "${categoryId}" was not found`,
      );
    }

    return this.prisma.menuItem.findMany({
      where: { categoryId },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const dish = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        recipes: {
          include: {
            inventoryItem: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!dish) {
      throw new NotFoundException(`Dish with ID "${id}" was not found`);
    }

    return dish;
  }

  async update(id: string, dto: UpdateDishDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Target category with ID "${dto.categoryId}" was not found`,
        );
      }
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    await this.findOne(id);

    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(id: string) {
    const dish = await this.findOne(id);

    if (dish._count.orderItems > 0) {
      throw new BadRequestException(
        `Cannot delete dish "${dish.name}": It has been referenced in ${dish._count.orderItems} past or active order items. Set availability to false instead.`,
      );
    }

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}
