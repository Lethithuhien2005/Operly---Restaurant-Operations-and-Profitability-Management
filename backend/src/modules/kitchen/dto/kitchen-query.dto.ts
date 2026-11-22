import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderItemStatus } from '../../../generated/prisma/enums.js';

export class KitchenQueryDto {
  @ApiPropertyOptional({
    enum: OrderItemStatus,
    description: 'Filter items by preparation status (PENDING, COOKING, READY)',
  })
  @IsOptional()
  @IsEnum(OrderItemStatus)
  status?: OrderItemStatus;

  @ApiPropertyOptional({
    description: 'Filter items by menu category name (e.g. Khai vị, Nướng, Lẩu)',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
