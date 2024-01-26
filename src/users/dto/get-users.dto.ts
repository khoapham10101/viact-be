import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class GetUsersDto {
  @ApiProperty({ required: false, description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiProperty({ required: false, description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  pageSize?: number;

  @ApiProperty({ required: false, description: 'Search term' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ required: false, description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, description: 'Sort order (asc or desc)', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  @Matches(/^(asc|desc)$/i, { message: 'sortOrder must be "asc" or "desc"' })
  sortOrder?: string;
}
