import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { VerificationController } from './verification/verification.controller';
import { JwtCustomService } from './jwt-custom/jwt-custom.service';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from './common/config/jwt.config';
import appConfig from './common/config/app.config';
import databaseConfig from './common/config/database.config';
import { validate } from './common/validation/env.validation';
import redisConfig from './common/config/redis.config';
import swaggerConfig from './common/config/swagger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, databaseConfig, redisConfig, swaggerConfig],
      validate,
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AppController, VerificationController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtCustomService,
  ],
})
export class AppModule {}
