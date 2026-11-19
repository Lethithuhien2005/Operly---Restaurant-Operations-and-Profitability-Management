import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignShiftDto {
  @ApiProperty({ description: 'Staff user ID (UUID)', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Shift ID (UUID)', example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @IsUUID()
  @IsNotEmpty()
  shiftId!: string;

  @ApiProperty({ description: 'Assigned date (YYYY-MM-DD)', example: '2026-11-20' })
  @IsDateString()
  @IsNotEmpty()
  assignedDate!: string;
}
