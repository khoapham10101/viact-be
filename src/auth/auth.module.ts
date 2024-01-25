import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BcryptService } from './bcrypt.service';
import { User } from '../users/entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { jwtConfig } from '../common/config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: () => jwtConfig(),
    }),
    MailModule,
    ConfigModule, // Add ConfigModule here
  ],
  controllers: [AuthController],
  providers: [AuthService, BcryptService, ConfigService], // Add ConfigService to the providers
  exports: [JwtModule],
})
export class AuthModule {}
