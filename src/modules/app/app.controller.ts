import {
  Controller,
  Get,
  Header,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get hello message' })
  @ApiProduces('text/plain')
  @ApiResponse({
    status: 200,
    description: 'Returns a hello message',
    content: {
      'text/plain': {
        schema: { type: 'string', example: 'Hello World!' },
      },
    },
  })
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Version(VERSION_NEUTRAL)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
