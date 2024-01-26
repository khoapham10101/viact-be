import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ActiveUser } from '../common/decorators/active-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { GetUsersDto } from 'src/users/dto/get-users.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { UserEditDto } from 'src/users/dto/user-edit.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: "Get logged in user's details", type: User })
  @ApiBearerAuth()
  @Get('me')
  async getMe(@ActiveUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @ApiOkResponse({
    description: 'Get list of users',
    type: [User],
  })
  @Post('/list')
  async getListUser(@Body() getUsersDto: GetUsersDto) {
    return this.usersService.getListUser(getUsersDto);
  }

  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiConflictResponse({
    description: 'Username or email already exists',
    status: HttpStatus.CONFLICT,
  })
  @Post('/add')
  async createUser(@Body() createUserDto: UserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiNotFoundResponse({
    description: 'User not found',
    status: HttpStatus.NOT_FOUND,
  })
  @Put('/:id')
  async editUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UserEditDto,
  ) {
    return this.usersService.editUser(userId, updateUserDto);
  }

  @ApiOkResponse({ description: 'Delete User Successful' })
  @ApiNotFoundResponse({
    description: 'User not found',
    status: HttpStatus.NOT_FOUND,
  })
  @Delete('/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
