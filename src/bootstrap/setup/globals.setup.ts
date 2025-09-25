import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType, RequestMethod } from '@nestjs/common';

import { AllExceptionsFilter } from '@common/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { ENV, EnvService, LOGGER, type LoggerService } from '@tokens';

export function setupGlobals(app: NestFastifyApplication) {
  const logger = app.get<LoggerService>(LOGGER);
  const env = app.get<EnvService>(ENV);

  app.useLogger(logger);
  app.setGlobalPrefix(env.apiPrefix, {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'health/live', method: RequestMethod.GET },
      { path: 'health/ready', method: RequestMethod.GET },
    ],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(app.get(AllExceptionsFilter));
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
}
