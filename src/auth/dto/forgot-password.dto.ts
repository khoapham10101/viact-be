
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
    readonly newPassword: string;

    @ApiProperty({
        example: 'newPassword123',
        description: 'Confirm password for the user',
    })
    @IsNotEmpty()
    @IsString()
    readonly confirmPassword: string;

}
