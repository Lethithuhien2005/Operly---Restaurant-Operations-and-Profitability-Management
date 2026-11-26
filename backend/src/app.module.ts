import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AttendanceModule } from './modules/attendance/attendance.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { KitchenModule } from './modules/kitchen/kitchen.module.js';
import { MenuModule } from './modules/menu/menu.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { ReservationsModule } from './modules/reservations/reservations.module.js';
import { StaffModule } from './modules/staff/staff.module.js';
import { TablesModule } from './modules/tables/tables.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RolesModule,
    UsersModule,
    AuthModule,
    TablesModule,
    MenuModule,
    ReservationsModule,
    OrdersModule,
    InventoryModule,
    KitchenModule,
    BillingModule,
    StaffModule,
    AttendanceModule,
    AnalyticsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
