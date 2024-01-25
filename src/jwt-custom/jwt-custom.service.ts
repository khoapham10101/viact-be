// jwt-custom.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtCustomService {
  constructor(private readonly jwtService: JwtService) {}

  async verify(token: string): Promise<{ email: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      return { email: decoded.email };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
