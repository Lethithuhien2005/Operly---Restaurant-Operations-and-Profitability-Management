import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class StockReceiptItemDto {
  @ApiProperty({
    description: 'Inventory item UUID to receive into stock',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'inventoryItemId must be a valid UUID' })
  @IsNotEmpty()
  inventoryItemId: string;

  @ApiProperty({
    description: 'Quantity delivered (in standard unit, e.g. kg, liters)',
    example: 10.5,
    minimum: 0.001,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.001, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiProperty({
    description: 'Unit purchase price (VND per standard unit)',
    example: 220000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Unit price must be a number' })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice: number;
}

export class CreateStockReceiptDto {
  @ApiPropertyOptional({
    description: 'Supplier or vendor commercial name',
    example: 'Công ty Thực phẩm Sạch CP Việt Nam',
  })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({
    description: 'List of received ingredient items',
    type: [StockReceiptItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Stock receipt must contain at least 1 item' })
  @ValidateNested({ each: true })
  @Type(() => StockReceiptItemDto)
  items: StockReceiptItemDto[];
}
