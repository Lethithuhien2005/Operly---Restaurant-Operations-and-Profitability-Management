import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';

export class RecipeIngredientDto {
  @ApiProperty({
    description: 'Inventory ingredient UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'inventoryItemId must be a valid UUID' })
  @IsNotEmpty()
  inventoryItemId: string;

  @ApiProperty({
    description: 'Quantity required per 1 serving of this dish (in standard unit, e.g. 0.150 kg beef for 1 Pho)',
    example: 0.15,
    minimum: 0.001,
  })
  @IsNumber({}, { message: 'quantityRequired must be a valid number' })
  @Min(0.001, { message: 'quantityRequired must be greater than 0' })
  quantityRequired: number;
}

export class SetRecipeBomDto {
  @ApiProperty({
    description: 'Menu item UUID for which the recipe BOM is defined',
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID(4, { message: 'menuItemId must be a valid UUID' })
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({
    description: 'Bill of materials: list of raw ingredients and required quantities',
    type: [RecipeIngredientDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Recipe BOM must contain at least 1 ingredient' })
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];
}
