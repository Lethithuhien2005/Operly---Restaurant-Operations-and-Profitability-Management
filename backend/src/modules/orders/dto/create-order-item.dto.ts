import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Menu item UUID',
    example: '323e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID(4, { message: 'menuItemId must be a valid UUID v4' })
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2,
    minimum: 1,
    maximum: 50,
  })
  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;

  @ApiProperty({
    description: 'Unit price at the time of ordering (snapshot price)',
    example: 65000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'unitPrice must be a valid number' })
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Customer notes / dietary requests for the kitchen',
    example: 'Ít ớt, không hành tây',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
