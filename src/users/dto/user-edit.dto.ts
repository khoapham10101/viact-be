import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UserEditDto {
  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'Phone number', example: '123456789' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'Address', example: '123 Main St, City, Country' })
  @IsString()
  @IsOptional()
  address?: string;
}
