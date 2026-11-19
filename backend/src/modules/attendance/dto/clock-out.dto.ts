import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ClockOutDto {
  @ApiProperty({ description: 'Active attendance record ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  attendanceId!: string;
}
