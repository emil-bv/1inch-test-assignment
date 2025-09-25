import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { buildPinoOptions } from '@common/modules/logger/pino-nest-logger';

import { AppModule } from '@modules/app/app.module';

export async function createApp(): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({
    logger: buildPinoOptions(),
    disableRequestLogging: true,
    bodyLimit: 1 * 1024 * 1024, // 1MB
    trustProxy: true,
  });

  return NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });
}
