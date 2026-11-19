import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty({
    description: 'Name of the ingredient or inventory item',
    example: 'Thịt bò phi lê',
  })
  @IsString()
  @IsNotEmpty({ message: 'Item name is required' })
  itemName: string;

  @ApiProperty({
    description: 'Standard unit of measure (e.g. kg, gram, lon, chai, quả)',
    example: 'kg',
  })
  @IsString()
  @IsNotEmpty({ message: 'Unit is required' })
  unit: string;

  @ApiPropertyOptional({
    description: 'Initial stock quantity',
    example: 25.5,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Current stock must be a number' })
  @Min(0, { message: 'Initial stock cannot be negative' })
  currentStock?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock alert threshold. Triggers low-stock warnings when stock <= threshold',
    example: 5.0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Alert threshold must be a number' })
  @Min(0, { message: 'Alert threshold cannot be negative' })
  minAlertThreshold?: number;
}
