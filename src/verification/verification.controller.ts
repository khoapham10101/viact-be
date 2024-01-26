// verification.controller.ts
import {
  Controller,
  Get,
  Param,
  Redirect,
  Query,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtCustomService } from 'src/jwt-custom/jwt-custom.service';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { createResponse } from 'src/common/response/response.helper';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('verification')
export class VerificationController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtCustomService: JwtCustomService,
  ) {}

  @Get()
  @Redirect('/login')
  async verifyEmail(
    @Query('token') token: string,
    @Req() request: Request,
  ): Promise<any> {
    const extractedToken = this.getToken(request);

    if (!extractedToken && !token) {
      // Handle case where token is not provided
      return createResponse(HttpStatus.BAD_REQUEST, 'Token Extracted');
    }

    // Use the provided token if available, otherwise use the extracted token
    const finalToken = token || extractedToken;

    // Verify the token and get the user's email
    try {
      // Verify the token and get the user's email
      const { email } = await this.verifyToken(finalToken);

      // Update the user's isVerify status to true
      await this.userService.updateIsVerify(email, true);

      // Return success response
      throw createResponse(HttpStatus.OK, 'Verification successful', { email });
    } catch (error) {
      // Handle verification error
      throw createResponse(HttpStatus.BAD_REQUEST, 'Verification failed');
    }
  }

  private async verifyToken(token: string): Promise<{ email: string }> {
    // Use JwtCustomService to verify the token and extract the email
    const { email } = await this.jwtCustomService.verify(token);
    return { email };
  }

  private getToken(request: Request) {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
