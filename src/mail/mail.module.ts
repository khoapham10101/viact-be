import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        secure: false,
        auth: {
          user: '0e0c16a4b3ca45',
          pass: '350621bd656971',
        },
      },
      defaults: {
        from: 'your-email@example.com',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
