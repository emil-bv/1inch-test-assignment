import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import cors from '@fastify/cors';

export async function registerCors(app: NestFastifyApplication) {
  await app.register(cors, { origin: true });
}
