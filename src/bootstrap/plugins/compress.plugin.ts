import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import compress from '@fastify/compress';

export async function registerCompress(app: NestFastifyApplication) {
  await app.register(compress, { global: true });
}
