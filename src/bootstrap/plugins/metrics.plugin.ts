import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyMetrics from 'fastify-metrics';

import { ENV, type EnvService } from '@tokens';

export async function registerMetrics(app: NestFastifyApplication) {
  const env = app.get<EnvService>(ENV);

  await app.register(fastifyMetrics, {
    endpoint: `/${env.apiPrefix}/metrics`,
    defaultMetrics: { enabled: true },
    routeMetrics: { enabled: true },
  });
}
