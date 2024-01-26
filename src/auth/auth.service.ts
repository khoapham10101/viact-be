import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository, FindOneOptions } from 'typeorm';
import { TokenExpiredError } from 'jsonwebtoken';

import { jwtConfig } from '../common/config/jwt.config';
import { MysqlErrorCode } from '../common/enums/error-codes.enum';
import { ActiveUserData } from '../common/interfaces/active-user-data.interface';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { BcryptService } from './bcrypt.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { MailService } from 'src/mail/mail.service';
import { createResponse } from 'src/common/response/response.helper';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SendEmailForgotPasswordDto } from '../mail/dto/send-email-forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}
  frontend_url = process.env.FRONTEND_URL || 'localhost:3000';

  async signUp(signUpDto: SignUpDto): Promise<any> {
    const { email, password, username, firstName, lastName, phoneNumber } =
      signUpDto;

    try {
      const user = new User();
      user.email = email;
      user.password = await this.bcryptService.hash(password);
      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      user.phoneNumber = phoneNumber;
      await this.userRepository.save(user);

      const token = await this.generateAccessToken(user);

      //Send Email after register
      const verificationLink = `${this.frontend_url}/verify-account?token=${token.accessToken}`;
      const additionalData = {
        message: 'Welcome to our platform!',
      };
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationLink,
        additionalData,
      );

      return createResponse(HttpStatus.CREATED, 'User created successfully');
    } catch (error) {
      if (error.code === MysqlErrorCode.UniqueViolation) {
        return createResponse(
          HttpStatus.CONFLICT,
          'Email: ' + email + ' or Username: ' + username + ' already exist',
        );
      }
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
      );
    }
  }

  async signIn(signInDto: SignInDto): Promise<any> {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return createResponse(HttpStatus.BAD_REQUEST, 'Invalid email');
    }

    const isPasswordMatch = await this.bcryptService.compare(
      password,
      user.password,
    );

    if (!isPasswordMatch) {
      return createResponse(HttpStatus.BAD_REQUEST, 'Invalid password');
    }

    try {
      const tokenGenerate = await this.generateAccessToken(user);

      if (!user.isVerify) {
        const verificationLink = `${this.frontend_url}/verify-account?token=${tokenGenerate.accessToken}`;
        const additionalData = {
          message: 'Welcome to our platform!',
        };
        await this.mailService.sendVerificationEmail(
          user.email,
          verificationLink,
          additionalData,
        );
        return createResponse(
          HttpStatus.NOT_ACCEPTABLE,
          'Please check Email to Verify',
        );
      } else {
        return createResponse(HttpStatus.OK, 'Login Successful', {
          accessToken: tokenGenerate.accessToken,
          expires: tokenGenerate.expires,
        });
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return createResponse(
          HttpStatus.UNAUTHORIZED,
          'Authorization token has expired',
        );
      }

      return createResponse(HttpStatus.UNAUTHORIZED, 'Invalid token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    try {
      const decodedToken = await this.jwtService.verifyAsync<ActiveUserData>(
        forgotPasswordDto.token,
        this.jwtConfiguration,
      );

      const user = await this.userRepository.findOne({
        where: { id: decodedToken.id },
      } as FindOneOptions<User>);
      
      if (!user) {
        return createResponse(HttpStatus.NOT_FOUND, 'User not found');
      }

      if (forgotPasswordDto.newPassword !== forgotPasswordDto.confirmPassword) {
        return createResponse(
          HttpStatus.BAD_REQUEST,
          'New password and confirm password do not match',
        );
      }

      // Update user's password
      user.password = await this.bcryptService.hash(
        forgotPasswordDto.newPassword,
      );
      await this.userRepository.save(user);

      // Invalidate previous access tokens
      await this.invalidateAllTokens(`user-${user.id}`);

      return createResponse(HttpStatus.OK, 'Password reset successful');
    } catch (error) {
      
      if (error instanceof TokenExpiredError) {
        return createResponse(
          HttpStatus.UNAUTHORIZED,
          'Password reset token has expired',
        );
      }

      return createResponse(
        HttpStatus.UNAUTHORIZED,
        'Invalid password reset token',
      );
    }
  }

  async requestEmailForgotPassword(
    sendEmailForgotPasswordDto: SendEmailForgotPasswordDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        email: sendEmailForgotPasswordDto.email,
      },
    });

    if (!user) {
      return createResponse(HttpStatus.NOT_FOUND, 'Not find Email in Database');
    }

    try {
      const tokenGenerate = await this.generateAccessToken(user);

      const verificationLink = `${this.frontend_url}/reset-password?token=${tokenGenerate.accessToken}`;
      const additionalData = {
        message: 'Reset new Password!',
      };
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationLink,
        additionalData,
      );
      return createResponse(HttpStatus.OK, 'Send Email Reset Password Link');
    } catch (error) {
      return createResponse(HttpStatus.BAD_REQUEST, error.message);
    }
  }

  async signOut(userId: string): Promise<void> {
    this.redisService.delete(`user-${userId}`);
  }

  async invalidateAllTokens(userId: string): Promise<void> {
    const userKeys = await this.redisService.getKeys(`user-${userId}*`);
    for (const key of userKeys) {
      await this.redisService.delete(key);
    }
  }
  async generateAccessToken(
    user: Partial<User>,
  ): Promise<{ accessToken: string; expires: number }> {
    const tokenId = randomUUID();

    await this.redisService.insert(`user-${user.id}`, tokenId);

    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        tokenId,
      } as ActiveUserData,
      {
        secret: this.jwtConfiguration.secret,
        expiresIn: '7d',
      },
    );
    const expires =
      this.jwtService.decode(accessToken)['exp'] -
      Math.floor(Date.now() / 1000);

    return { accessToken, expires };
  }
}
