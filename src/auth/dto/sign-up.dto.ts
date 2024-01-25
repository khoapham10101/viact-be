import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Match } from '../../common/decorators/match.decorator';

export class SignUpDto {
  @ApiProperty({
    example: 'user123',
    description: 'Username of user',
  })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of user',
  })
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of user',
  })
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({
    example: 'atest@email.com',
    description: 'Email of user',
  })
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Password of user',
    example: 'Pass#123',
  })
  @MinLength(8, {
    message: 'password too short',
  })
  @MaxLength(20, {
    message: 'password too long',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    description: 'Repeat same value as in password field',
    example: 'Pass#123',
  })
  @Match('password')
  @IsNotEmpty()
  readonly passwordConfirm: string;
}
