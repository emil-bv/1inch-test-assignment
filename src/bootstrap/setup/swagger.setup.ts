import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { ENV, EnvService, LOGGER, type LoggerService } from '@tokens';

export interface SwaggerOptions {
  path?: string;
  enableInProd?: boolean;
  logger?: LoggerService;
}

export function setupSwagger(
  app: NestFastifyApplication,
  opts: SwaggerOptions = {},
) {
  const logger = app.get<LoggerService>(LOGGER);
  const env = app.get<EnvService>(ENV);

  const { path = 'docs', enableInProd = false } = opts;

  const enabled = enableInProd || !env.isProd;

  if (!enabled) {
    logger?.debug?.('[swagger] disabled');
    return;
  }

  try {
    const config = new DocumentBuilder()
      .setTitle('1inch Test Assignment API')
      .setDescription('API documentation for the 1inch test assignment')
      .setVersion('1.0.0')
      .addTag('ethereum')
      .addTag('amm')
      .addTag('gas')
      // .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(path, app, document, {
      useGlobalPrefix: true,
      swaggerOptions: { persistAuthorization: true },
    });

    logger?.log?.({ event: 'swagger_setup_done', path }, '[swagger] ready');
  } catch (e) {
    logger?.error?.('[swagger] setup failed', e as any);
  }
}
