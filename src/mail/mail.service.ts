import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendVerificationEmail(
    email: string,
    verificationLink: string,
    additionalData: any,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email',
      template: './verification',
      context: {
        verificationLink,
        ...additionalData,
      },
      text:
        additionalData ? additionalData.message +
          verificationLink :
          'Please verify your email by clicking the following link: ' +
          verificationLink,
      html:
        additionalData ? additionalData.message +
          '</p><a href="http://' + verificationLink + '">Verify Email</a>' :
          '<p>Please verify your email by clicking the following link:</p><a href="http://' +
          verificationLink +
          '">Verify Email</a>',
    });
  }
}
