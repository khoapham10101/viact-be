import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { createResponse } from './common/response/response.helper';

@ApiTags('Check Connect')
@Controller('/test-connect')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({ description: "Check Connection Successfull" })
  @Public()
  @Get()
  getHello(): any {
    try {
      const helloMessage = this.appService.checkConnect();
      return createResponse(200, 'Success', { message: helloMessage });
    } catch (error) {
      return createResponse(500, 'Internal Server Error');
    }
  }
}
