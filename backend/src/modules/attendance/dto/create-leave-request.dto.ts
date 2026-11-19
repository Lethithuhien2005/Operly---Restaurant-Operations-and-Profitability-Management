import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'Leave start date (YYYY-MM-DD)', example: '2026-11-25' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ description: 'Leave end date (YYYY-MM-DD)', example: '2026-11-26' })
  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @ApiProperty({ description: 'Detailed reason for leave request', example: 'Family personal matter' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
