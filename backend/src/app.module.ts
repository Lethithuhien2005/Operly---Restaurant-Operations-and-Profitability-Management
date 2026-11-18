import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { MenuModule } from './modules/menu/menu.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { ReservationsModule } from './modules/reservations/reservations.module.js';
import { RestaurantsModule } from './modules/restaurants/restaurants.module.js';
import { TablesModule } from './modules/tables/tables.module.js';
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
    RestaurantsModule,
    TablesModule,
    MenuModule,
    ReservationsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
