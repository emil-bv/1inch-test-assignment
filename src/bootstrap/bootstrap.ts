import { LOGGER, type LoggerService, ENV, type EnvService } from '@tokens';

import { createApp } from './create-app';
import { registerCors } from './plugins/cors.plugin';
import { registerHelmet } from './plugins/helmet.plugin';
import { registerCompress } from './plugins/compress.plugin';
import { registerRateLimit } from './plugins/rate-limit.plugin';
import { registerMetrics } from './plugins/metrics.plugin';
import { setupSwagger } from './setup/swagger.setup';
import { setupGlobals } from './setup/globals.setup';

export async function bootstrap() {
  const app = await createApp();

  setupGlobals(app);

  await registerMetrics(app);
  await registerCors(app);
  await registerHelmet(app);
  await registerCompress(app);
  await registerRateLimit(app);

  setupSwagger(app, { enableInProd: true });

  const logger = app.get<LoggerService>(LOGGER);
  const env = app.get<EnvService>(ENV);

  app.enableShutdownHooks(['SIGINT', 'SIGTERM']);
  await app.listen({ port: env.port, host: '0.0.0.0' });

  const url = (await app.getUrl()).replace('0.0.0.0', 'localhost');
  logger.log({ event: 'app_listening', url }, '[app] ready');
}
