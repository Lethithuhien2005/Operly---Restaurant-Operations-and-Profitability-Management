import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ description: 'Parent restaurant UUID' })
  @IsUUID('4', { message: 'restaurantId must be a valid UUID' })
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ example: 'Operly Central Branch - Da Nang', description: 'Branch name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '456 Le Duan, Hai Chau District, Da Nang' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: '02361234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'danang.central@operly.vn' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateBranchNestedDto {
  @ApiProperty({ example: 'Operly Central Branch - Da Nang', description: 'Branch name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '456 Le Duan, Hai Chau District, Da Nang' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: '02361234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'danang.central@operly.vn' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
