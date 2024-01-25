import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    description: 'Email From',
    example: 'atest@email.com',
  })
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  readonly emailFrom: string;

  @ApiProperty({
    description: 'EMail To',
    example: 'atest@email.com',
  })
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  readonly emailTo: string;

  @ApiProperty({
    description: 'Subject',
    example: 'This is Subject',
  })
  @MaxLength(255)
  @IsNotEmpty()
  readonly subject: string;

  @ApiProperty({
    description: 'Content',
    example: 'This is Content',
  })
  @IsNotEmpty()
  readonly content: string;
}
