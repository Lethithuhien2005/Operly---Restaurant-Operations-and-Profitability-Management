import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateBranchDto } from './create-branch.dto.js';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiPropertyOptional({ description: 'Parent restaurant UUID if reassigning' })
  @IsOptional()
  @IsUUID('4', { message: 'restaurantId must be a valid UUID' })
  restaurantId?: string;
}
