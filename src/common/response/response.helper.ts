import { HttpStatus, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';

export const createResponse = (
  statusCode: number = HttpStatus.OK,
  message: string = 'Success',
  other?: Record<string, any>,
) => {

  return {
    statusCode,
    message,
    data: other || null,
  };
};