import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
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

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { email, password, username, firstName, lastName } = signUpDto;

    try {
      const user = new User();
      user.email = email;
      user.password = await this.bcryptService.hash(password);
      user.username = username;
      user.firstName = firstName;
      user.lastName = lastName;
      await this.userRepository.save(user);

      const token = this.jwtService.sign({ email });
      const host = process.env.HOST || 'localhost';
      const port = process.env.PORT || 3030;

      //Send Email after register
      const verificationLink = `${host}:${port}?token=${token}`;
      const additionalData = {
        message: 'Welcome to our platform!',
        // Add any other additional data here
      };
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationLink,
        additionalData,
      );
    } catch (error) {
      if (error.code === MysqlErrorCode.UniqueViolation) {
        throw new ConflictException(
          `User [${email}] or [${username}] already exist`,
        );
      }
      throw error;
    }
  }

  async signIn(signInDto: SignInDto): Promise<{
    [x: string]: any;
    accessToken: string;
  }> {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const isPasswordMatch = await this.bcryptService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid password');
    }

    try {
      return await this.generateAccessToken(user);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Authorization token has expired');
      }

      throw new UnauthorizedException('Invalid token');
    }
  }

  async signOut(userId: string): Promise<void> {
    this.redisService.delete(`user-${userId}`);
  }

  async generateAccessToken(
    user: Partial<User>,
  ): Promise<{ accessToken: string }> {
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

    return { accessToken };
  }
}
