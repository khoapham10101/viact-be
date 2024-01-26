import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Like, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { createResponse } from 'src/common/response/response.helper';
import { GetUsersDto } from 'src/users/dto/get-users.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { hash } from 'bcrypt';
import { UserEditDto } from 'src/users/dto/user-edit.dto';

@Injectable()
export class UsersService {
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

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return createResponse(HttpStatus.NOT_FOUND, 'User not found');
    }

    return createResponse(
      HttpStatus.OK,
      'Get Current User Profile Succefull',
      user,
    );
  }

  async getListUser(getUsersDto: GetUsersDto) {
    try {
      const {
        page = 1,
        pageSize = 10,
        searchTerm,
        sortBy,
        sortOrder,
      } = getUsersDto;

      const order: 'ASC' | 'DESC' = sortOrder === 'desc' ? 'DESC' : 'ASC';

      const options: FindManyOptions<User> = {
        take: pageSize,
        skip: (page - 1) * pageSize,
        order: sortBy ? { [sortBy]: order } : undefined,
        where: searchTerm
          ? [
              { username: Like(`%${searchTerm}%`) },
              { email: Like(`%${searchTerm}%`) },
            ]
          : undefined,
      };

      const users = await this.userRepository.find(options);

      return createResponse(
        HttpStatus.OK,
        'Get List Users Successfully',
        users,
      );
    } catch (error) {
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
        error.message,
      );
    }
  }

  async createUser(createUserDto: UserDto) {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      phoneNumber,
      avatarUrl,
      address,
    } = createUserDto;

    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      return createResponse(
        HttpStatus.BAD_REQUEST,
        'Username or email already exists',
      );
    } else {
      try {
        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Create and save the new user
        const newUser = this.userRepository.create({
          firstName,
          lastName,
          username,
          email,
          password: hashedPassword,
          phoneNumber,
          avatarUrl,
          address,
        });
        await this.userRepository.save(newUser);

        return createResponse(
          HttpStatus.CREATED,
          'Create new user successfull',
          newUser,
        );
      } catch (error) {
        return createResponse(400, 'Error when create user');
      }
    }
  }

  async editUser(userId: string, updateUserDto: UserEditDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return createResponse(HttpStatus.NOT_FOUND, 'user not found');
      }

      if (updateUserDto.password) {
        // Hash the password only if it's provided
        const hashedPassword = await hash(updateUserDto.password, 10);
        user.password = hashedPassword;
      }

      user.firstName = updateUserDto.firstName ?? user.firstName;
      user.lastName = updateUserDto.lastName ?? user.lastName;
      user.phoneNumber = updateUserDto.phoneNumber ?? user.phoneNumber;
      user.avatarUrl = updateUserDto.avatarUrl ?? user.avatarUrl;
      user.address = updateUserDto.address ?? user.address;

      await this.userRepository.update(userId, user);

      return createResponse(HttpStatus.OK, 'Update User Successfull', user);
    } catch (error) {
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error when update user',
      );
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return createResponse(HttpStatus.NOT_FOUND, 'User not found');
      }

      await this.userRepository.remove(user);

      return createResponse(HttpStatus.OK, 'Delete User Sucessfull');
    } catch (error) {
      return createResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error when delete user',
      );
    }
  }
}
