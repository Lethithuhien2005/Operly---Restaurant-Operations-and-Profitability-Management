import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Menu item UUID',
    example: '323e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID('4', { message: 'menuItemId must be a valid UUID v4' })
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity ordered (1 to 50)',
    example: 2,
    minimum: 1,
    maximum: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Unit price override in VND (if omitted, backend securely uses active catalog price)',
    example: 65000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({
    description: 'Customer notes / dietary requests for the kitchen',
    example: 'Less spicy, no onions',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
