// verification.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { JwtCustomService } from 'src/jwt-custom/jwt-custom.service';
import { UsersService } from 'src/users/users.service';
import { createResponse } from 'src/common/response/response.helper';
import { ApiTags } from '@nestjs/swagger';
import { TokenDto } from './dto/token.dto';

@ApiTags('Authentication')
@Controller('verification')
export class VerificationController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtCustomService: JwtCustomService,
  ) {}

  @Post()
  async verifyEmail(
    @Body() TokenDto: TokenDto,
  ): Promise<any> {

    if (!TokenDto.token) {
      return createResponse(HttpStatus.BAD_REQUEST, 'False When verify email');
    }

    const finalToken = TokenDto.token;

    const { email } = await this.verifyToken(finalToken);

    await this.userService.updateIsVerify(email, true);
    return createResponse(HttpStatus.OK, 'Verify Email Successful', { email });

  }

  private async verifyToken(token: string): Promise<{ email: string }> {
    const { email } = await this.jwtCustomService.verify(token);
    return { email };
  }
}
