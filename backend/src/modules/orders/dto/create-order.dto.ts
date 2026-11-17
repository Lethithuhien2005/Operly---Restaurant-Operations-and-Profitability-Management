import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto.js';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Active dining session UUID',
    example: '423e4567-e89b-12d3-a456-426614174003',
  })
  @IsUUID(4, { message: 'sessionId must be a valid UUID v4' })
  @IsNotEmpty()
  sessionId: string;

  @ApiPropertyOptional({
    description: 'Waiter UUID placing the order on behalf of the customer (null if self-scanned QR)',
    example: '523e4567-e89b-12d3-a456-426614174004',
  })
  @IsOptional()
  @IsUUID(4, { message: 'waiterId must be a valid UUID v4' })
  waiterId?: string;

  @ApiProperty({
    description: 'List of order items with quantity and preparation notes',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must contain at least 1 item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
