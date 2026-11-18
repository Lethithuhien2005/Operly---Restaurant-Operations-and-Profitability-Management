import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { UpdateBranchDto } from './dto/update-branch.dto.js';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBranchDto) {
    // Validate restaurant existence
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Parent restaurant with ID "${dto.restaurantId}" was not found`,
      );
    }

    // Check branch name uniqueness within the same restaurant
    const existing = await this.prisma.branch.findFirst({
      where: {
        restaurantId: dto.restaurantId,
        name: { equals: dto.name, mode: 'insensitive' },
      },
    });
    if (existing) {
      throw new ConflictException(
        `A branch with name "${dto.name}" already exists for this restaurant`,
      );
    }

    return this.prisma.branch.create({
      data: {
        restaurantId: dto.restaurantId,
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        isActive: dto.isActive ?? true,
      },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(restaurantId?: string, isActive?: boolean) {
    return this.prisma.branch.findMany({
      where: {
        ...(restaurantId ? { restaurantId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            tables: true,
            reservations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" was not found`,
      );
    }

    return this.prisma.branch.findMany({
      where: { restaurantId },
      include: {
        _count: {
          select: {
            tables: true,
            reservations: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        restaurant: true,
        tables: {
          orderBy: { tableNumber: 'asc' },
        },
        _count: {
          select: {
            tables: true,
            reservations: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" was not found`);
    }

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);

    if (dto.restaurantId) {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: dto.restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException(
          `Target restaurant with ID "${dto.restaurantId}" was not found`,
        );
      }
    }

    return this.prisma.branch.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(id: string) {
    const branch = await this.findOne(id);

    // Prevent deletion if branch has tables
    if (branch._count.tables > 0) {
      throw new BadRequestException(
        `Cannot delete branch: ${branch._count.tables} table(s) are currently associated with it. Delete or reassign tables first.`,
      );
    }

    // Prevent deletion if branch has reservations
    if (branch._count.reservations > 0) {
      throw new BadRequestException(
        `Cannot delete branch: ${branch._count.reservations} reservation(s) are currently associated with it.`,
      );
    }

    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
