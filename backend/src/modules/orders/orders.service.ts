import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  OrderItemStatus,
  OrderStatus,
  SessionStatus,
  TableStatus,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AddOrderItemsDto } from './dto/add-order-items.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderQueryDto } from './dto/order-query.dto.js';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto.js';
import { UpdateOrderItemDto } from './dto/update-order-item.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    if (!dto.sessionId && !dto.tableId) {
      throw new BadRequestException('Either sessionId or tableId must be provided to place an order');
    }

    return this.prisma.$transaction(async (tx) => {
      let session: any = null;

      // 1. Resolve or dynamically create the active DiningSession
      if (dto.sessionId) {
        session = await tx.diningSession.findUnique({
          where: { id: dto.sessionId },
          include: {
            table: {
              include: { branch: true },
            },
          },
        });
        if (!session) {
          throw new NotFoundException(`Dining session with ID "${dto.sessionId}" was not found`);
        }
        if (session.status === SessionStatus.CLOSED || session.status === SessionStatus.CANCELLED) {
          throw new BadRequestException(`Cannot place orders on a ${session.status} dining session`);
        }
      } else if (dto.tableId) {
        const table = await tx.table.findUnique({
          where: { id: dto.tableId },
          include: { branch: true },
        });
        if (!table) {
          throw new NotFoundException(`Table with ID "${dto.tableId}" was not found`);
        }

        // Find existing open session on this table
        session = await tx.diningSession.findFirst({
          where: {
            tableId: dto.tableId,
            status: { in: [SessionStatus.OPEN, SessionStatus.PAYING] },
          },
          include: { table: { include: { branch: true } } },
        });

        // If none exists, automatically create a new dining session for the table
        if (!session) {
          const sessionCode = `SESS-${Date.now().toString().slice(-6)}-${randomUUID().slice(0, 4).toUpperCase()}`;
          session = await tx.diningSession.create({
            data: {
              sessionCode,
              tableId: dto.tableId,
              customerCount: 1,
              status: SessionStatus.OPEN,
            },
            include: { table: { include: { branch: true } } },
          });
        }
      }

      // 2. Validate all ordered dish references and check availability
      const dishIds = dto.items.map((i) => i.menuItemId);
      const dishes = await tx.menuItem.findMany({
        where: { id: { in: dishIds } },
      });

      if (dishes.length !== new Set(dishIds).size) {
        const foundIds = new Set(dishes.map((d) => d.id));
        const missingIds = dishIds.filter((id) => !foundIds.has(id));
        throw new NotFoundException(`Dish(es) not found: [${missingIds.join(', ')}]`);
      }

      const dishMap = new Map(dishes.map((d) => [d.id, d]));

      for (const item of dto.items) {
        const dish = dishMap.get(item.menuItemId)!;
        if (!dish.isAvailable) {
          throw new BadRequestException(
            `Dish "${dish.name}" is currently 86'd out of stock and cannot be ordered`,
          );
        }
      }

      // 3. Compute backend line item prices and total order amount
      let orderTotal = 0;
      const orderItemsData = dto.items.map((item) => {
        const dish = dishMap.get(item.menuItemId)!;
        const unitPrice =
          item.unitPrice !== undefined && item.unitPrice !== null
            ? item.unitPrice
            : Number(dish.price);
        const costPrice = dish.costPrice ? Number(dish.costPrice) : 0;
        const lineTotal = unitPrice * item.quantity;
        orderTotal += lineTotal;

        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice,
          costPrice,
          notes: item.notes || null,
          itemStatus: OrderItemStatus.PENDING,
        };
      });

      // 4. Create the Order entity
      const orderCode = `ORD-${Date.now().toString().slice(-6)}-${randomUUID().slice(0, 4).toUpperCase()}`;
      const order = await tx.order.create({
        data: {
          orderCode,
          sessionId: session.id,
          waiterId: dto.waiterId || null,
          status: OrderStatus.CREATED,
          totalAmount: orderTotal,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              menuItem: {
                select: { id: true, name: true, price: true, imageUrl: true },
              },
            },
          },
          session: {
            include: {
              table: {
                include: {
                  branch: {
                    select: { id: true, name: true, restaurantId: true },
                  },
                },
              },
            },
          },
        },
      });

      // 5. Update physical table status to OCCUPIED if currently AVAILABLE or RESERVED
      if (session.tableId) {
        await tx.table.update({
          where: { id: session.tableId },
          data: { status: TableStatus.OCCUPIED },
        });
      }

      return order;
    });
  }

  async findAll(query?: OrderQueryDto) {
    let dateFilter: any = undefined;
    if (query?.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      dateFilter = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.order.findMany({
      where: {
        ...(query?.sessionId ? { sessionId: query.sessionId } : {}),
        ...(query?.status ? { status: query.status } : {}),
        ...(query?.tableId ? { session: { tableId: query.tableId } } : {}),
        ...(query?.branchId
          ? { session: { table: { branchId: query.branchId } } }
          : {}),
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        session: {
          include: {
            table: {
              include: {
                branch: {
                  select: { id: true, name: true, restaurantId: true },
                },
              },
            },
          },
        },
        waiter: {
          select: { id: true, fullName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
        session: {
          include: {
            table: {
              include: {
                branch: {
                  include: { restaurant: true },
                },
              },
            },
          },
        },
        waiter: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" was not found`);
    }

    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        waiterId: dto.waiterId,
      },
      include: {
        orderItems: true,
      },
    });
  }

  async addItems(orderId: string, dto: AddOrderItemsDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });
      if (!order) {
        throw new NotFoundException(`Order with ID "${orderId}" was not found`);
      }
      if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(`Cannot add items to an order with status "${order.status}"`);
      }

      const dishIds = dto.items.map((i) => i.menuItemId);
      const dishes = await tx.menuItem.findMany({
        where: { id: { in: dishIds } },
      });

      if (dishes.length !== new Set(dishIds).size) {
        throw new NotFoundException('One or more specified dishes do not exist');
      }

      const dishMap = new Map(dishes.map((d) => [d.id, d]));

      for (const item of dto.items) {
        const dish = dishMap.get(item.menuItemId)!;
        if (!dish.isAvailable) {
          throw new BadRequestException(`Dish "${dish.name}" is 86'd out of stock`);
        }
      }

      let addedSubtotal = 0;
      for (const item of dto.items) {
        const dish = dishMap.get(item.menuItemId)!;
        const unitPrice =
          item.unitPrice !== undefined && item.unitPrice !== null
            ? item.unitPrice
            : Number(dish.price);
        const costPrice = dish.costPrice ? Number(dish.costPrice) : 0;
        addedSubtotal += unitPrice * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice,
            costPrice,
            notes: item.notes || null,
            itemStatus: OrderItemStatus.PENDING,
          },
        });
      }

      const newTotal = Number(order.totalAmount) + addedSubtotal;

      return tx.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotal },
        include: {
          orderItems: {
            include: { menuItem: true },
          },
        },
      });
    });
  }

  async updateItem(orderId: string, itemId: string, dto: UpdateOrderItemDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findFirst({
        where: { id: itemId, orderId },
      });
      if (!item) {
        throw new NotFoundException(`Order item with ID "${itemId}" was not found in order "${orderId}"`);
      }

      if (dto.quantity !== undefined && dto.quantity !== item.quantity) {
        await tx.orderItem.update({
          where: { id: itemId },
          data: {
            quantity: dto.quantity,
            notes: dto.notes !== undefined ? dto.notes : item.notes,
          },
        });

        // Recalculate order total from all items
        const allItems = await tx.orderItem.findMany({
          where: { orderId },
        });
        const newTotal = allItems.reduce(
          (sum, it) => sum + Number(it.unitPrice) * it.quantity,
          0,
        );

        return tx.order.update({
          where: { id: orderId },
          data: { totalAmount: newTotal },
          include: { orderItems: true },
        });
      }

      if (dto.notes !== undefined) {
        await tx.orderItem.update({
          where: { id: itemId },
          data: { notes: dto.notes },
        });
      }

      return tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });
    });
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    dto: UpdateOrderItemStatusDto,
  ) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (!item) {
      throw new NotFoundException(`Order item "${itemId}" was not found in order "${orderId}"`);
    }

    const updatedItem = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        itemStatus: dto.itemStatus,
        rejectionReason: dto.rejectionReason || null,
      },
      include: { menuItem: true },
    });

    // Check if all items in order are served; if so, update order status to SERVED
    const allItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });
    const allServed = allItems.every(
      (it) => it.itemStatus === OrderItemStatus.SERVED || it.itemStatus === OrderItemStatus.REJECTED,
    );
    if (allServed && allItems.length > 0) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.SERVED },
      });
    }

    return updatedItem;
  }

  async removeItem(orderId: string, itemId: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findFirst({
        where: { id: itemId, orderId },
      });
      if (!item) {
        throw new NotFoundException(`Order item "${itemId}" not found in order "${orderId}"`);
      }

      // Safety check: Cannot remove cooking or served dishes
      if (
        item.itemStatus === OrderItemStatus.COOKING ||
        item.itemStatus === OrderItemStatus.READY ||
        item.itemStatus === OrderItemStatus.SERVED
      ) {
        throw new BadRequestException(
          `Cannot remove item with status "${item.itemStatus}". Contact kitchen supervisor to reject or void instead.`,
        );
      }

      await tx.orderItem.delete({
        where: { id: itemId },
      });

      // Recalculate order total
      const remainingItems = await tx.orderItem.findMany({
        where: { orderId },
      });
      const newTotal = remainingItems.reduce(
        (sum, it) => sum + Number(it.unitPrice) * it.quantity,
        0,
      );

      return tx.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotal },
        include: { orderItems: true },
      });
    });
  }
}
