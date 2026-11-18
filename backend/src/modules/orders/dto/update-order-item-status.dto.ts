import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderItemStatus } from '../../../generated/prisma/enums.js';

export class UpdateOrderItemStatusDto {
  @ApiProperty({
    enum: OrderItemStatus,
    example: OrderItemStatus.COOKING,
    description: 'Updated kitchen preparation status for this dish item',
  })
  @IsEnum(OrderItemStatus)
  @IsNotEmpty()
  itemStatus: OrderItemStatus;

  @ApiPropertyOptional({
    description: 'Reason if item is rejected by kitchen',
    example: 'Ingredient ran out / 86 out of stock',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
