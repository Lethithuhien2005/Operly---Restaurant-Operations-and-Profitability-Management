import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBillDto {
  @ApiProperty({ description: 'Dining session ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiPropertyOptional({ description: 'Optional promotion code', example: 'SUMMER2026' })
  @IsOptional()
  @IsString()
  promotionCode?: string;
}
