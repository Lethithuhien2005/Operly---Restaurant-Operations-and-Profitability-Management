import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/enums.js';

export class OrderQueryDto {
  @ApiPropertyOptional({ description: 'Filter by dining session UUID' })
  @IsOptional()
  @IsUUID('4')
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Filter by dining table UUID' })
  @IsOptional()
  @IsUUID('4')
  tableId?: string;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by order status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter orders by date (YYYY-MM-DD)',
    example: '2026-11-20',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
