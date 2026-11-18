import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateOrderItemDto {
  @ApiPropertyOptional({
    description: 'Updated quantity (1-50)',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Updated preparation notes',
    example: 'Extra spicy, sauce on side',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
