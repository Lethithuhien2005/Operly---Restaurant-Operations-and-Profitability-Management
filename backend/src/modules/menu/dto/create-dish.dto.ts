import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateDishDto {
  @ApiProperty({ description: 'Category UUID to which the dish belongs' })
  @IsUUID('4', { message: 'categoryId must be a valid UUID' })
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'Seafood Spicy Hotpot', description: 'Dish / menu item name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Fresh prawns, squid, clams, spicy lemongrass broth.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 280000, description: 'Selling price in VND' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 95000, description: 'Raw ingredient cost price in VND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 'https://images.operly.vn/dishes/hotpot.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, default: true, description: 'Availability / 86 toggle' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: true, default: true, description: 'Eligible for AI recommendations' })
  @IsOptional()
  @IsBoolean()
  isRecommendable?: boolean;
}
