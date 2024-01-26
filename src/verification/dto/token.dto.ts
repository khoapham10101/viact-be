import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'Token', example: 'This is Token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
