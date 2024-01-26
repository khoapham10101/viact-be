import {
  HttpStatus,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

export const createResponse = (
  statusCode: number = HttpStatus.OK,
  message: string = 'Success',
  other?: Record<string, any>,
) => {
  switch (statusCode) {
    case HttpStatus.CONFLICT:
      throw new ConflictException(message, 'CONFLICT');
    case HttpStatus.BAD_REQUEST:
      throw new BadRequestException(message, 'BAD_REQUEST');
    case HttpStatus.UNAUTHORIZED:
      throw new UnauthorizedException(message, 'UNAUTHORIZED');
    case HttpStatus.NOT_FOUND:
      throw new UnauthorizedException(message, 'NOT_FOUND');
    default:
      return {
        statusCode,
        message,
        data: other || null,
      };
  }
};
