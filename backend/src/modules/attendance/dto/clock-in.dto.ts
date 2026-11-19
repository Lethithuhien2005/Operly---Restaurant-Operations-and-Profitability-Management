import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ClockInDto {
  @ApiProperty({ description: 'Shift assignment ID', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  shiftAssignmentId!: string;

  @ApiPropertyOptional({ description: 'Current device GPS latitude', example: 10.7769 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Current device GPS longitude', example: 106.7009 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Connected restaurant Wi-Fi BSSID / MAC address', example: '00:14:22:01:23:45' })
  @IsOptional()
  @IsString()
  wifiBssid?: string;
}
