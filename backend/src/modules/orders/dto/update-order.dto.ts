import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../../../generated/prisma/enums.js';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Updated overall status of the order batch',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Assigned waiter UUID',
  })
  @IsOptional()
  @IsUUID('4')
  waiterId?: string;
}
