import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';

export async function registerHelmet(app: NestFastifyApplication) {
  await app.register(helmet, { contentSecurityPolicy: false });
}
