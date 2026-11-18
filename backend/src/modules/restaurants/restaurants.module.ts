import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { BranchesController } from './branches.controller.js';
import { BranchesService } from './branches.service.js';
import { RestaurantsController } from './restaurants.controller.js';
import { RestaurantsService } from './restaurants.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantsController, BranchesController],
  providers: [RestaurantsService, BranchesService],
  exports: [RestaurantsService, BranchesService],
})
export class RestaurantsModule {}
