import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  checkConnect(): string {
    return 'Connect successful!';
  }
}
