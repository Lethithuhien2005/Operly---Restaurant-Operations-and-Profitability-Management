import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleName } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: RoleName) {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return role;
  }

  async getCustomerRole() {
    let customerRole = await this.findByName(RoleName.CUSTOMER);

    // If role has not been seeded yet, safely create it
    if (!customerRole) {
      customerRole = await this.prisma.role.create({
        data: {
          name: RoleName.CUSTOMER,
          description: 'Standard customer account for dining and reservations',
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    }

    return customerRole;
  }

  async findById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return role;
  }
}
