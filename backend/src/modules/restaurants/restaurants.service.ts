import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRestaurantDto } from './dto/create-restaurant.dto.js';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto.js';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        name: dto.name,
        description: dto.description,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(isActive?: boolean) {
    return this.prisma.restaurant.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            isActive: true,
            _count: {
              select: { tables: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        branches: {
          include: {
            _count: {
              select: {
                tables: true,
                reservations: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" was not found`);
    }

    return restaurant;
  }

  async update(id: string, dto: UpdateRestaurantDto) {
    await this.findOne(id);

    return this.prisma.restaurant.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    const restaurant = await this.findOne(id);

    // Prevent deletion if any branch has tables or reservations
    const totalTables = restaurant.branches.reduce(
      (sum, b) => sum + (b._count?.tables ?? 0),
      0,
    );
    if (totalTables > 0) {
      throw new BadRequestException(
        `Cannot delete restaurant: ${totalTables} table(s) exist across its branches. Remove or reassign tables first.`,
      );
    }

    return this.prisma.restaurant.delete({
      where: { id },
    });
  }
}
