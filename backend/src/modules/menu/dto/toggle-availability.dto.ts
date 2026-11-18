import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleAvailabilityDto {
  @ApiProperty({
    example: false,
    description: 'Set availability status (false = 86 out of stock, true = available)',
  })
  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;
}
