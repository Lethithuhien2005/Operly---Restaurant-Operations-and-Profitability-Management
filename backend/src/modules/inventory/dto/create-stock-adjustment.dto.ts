import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { StockMovementType } from '../../../generated/prisma/enums.js';

export class CreateStockAdjustmentDto {
  @ApiProperty({
    description: 'Inventory item UUID to adjust or log spoilage for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'inventoryItemId must be a valid UUID' })
  @IsNotEmpty()
  inventoryItemId: string;

  @ApiProperty({
    enum: [StockMovementType.WASTE_SPOILED, StockMovementType.ADJUSTMENT],
    description: 'Type of movement: WASTE_SPOILED (spoilage loss) or ADJUSTMENT (physical count audit)',
    example: StockMovementType.WASTE_SPOILED,
  })
  @IsEnum([StockMovementType.WASTE_SPOILED, StockMovementType.ADJUSTMENT], {
    message: 'movementType must be either WASTE_SPOILED or ADJUSTMENT',
  })
  movementType: StockMovementType;

  @ApiProperty({
    description:
      'Quantity adjustment. For WASTE_SPOILED, enter positive amount to decrement. For ADJUSTMENT, enter delta (+/-)',
    example: 2.5,
  })
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Reason for spoilage or count variance note',
    example: 'Hỏng do mất điện tủ đông ngăn mát',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
