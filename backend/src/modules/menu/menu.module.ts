import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { DishesController } from './dishes.controller.js';
import { DishesService } from './dishes.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController, DishesController],
  providers: [CategoriesService, DishesService],
  exports: [CategoriesService, DishesService],
})
export class MenuModule {}
