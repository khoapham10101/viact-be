
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {

    @ApiProperty({
        example: 'reset-token',
        description: 'Token for password reset',
    })
    @IsNotEmpty()
    @IsString()
    readonly token: string;
    
    @ApiProperty({
        example: 'newPassword123',
        description: 'New password for the user',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'Password should be at least 8 characters long',
    })
    readonly newPassword: string;

    @ApiProperty({
        example: 'newPassword123',
        description: 'Confirm password for the user',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'Password should be at least 8 characters long',
    })
    readonly confirmPassword: string;

}
