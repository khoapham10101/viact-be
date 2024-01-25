import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Find a user by email
  async findByEmail(email: string): Promise<User | undefined> {
    const options: FindOneOptions<User> = { where: { email } };
    return this.userRepository.findOne(options);
  }

  async updateIsVerify(email: string, isVerify: boolean): Promise<boolean> {
    const user = await this.findByEmail(email);

    if (user) {
      user.isVerify = isVerify;

      // Make sure to await the save method
      await this.userRepository.save(user);

      return true; // Successfully updated
    }

    return false; // User not found
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
