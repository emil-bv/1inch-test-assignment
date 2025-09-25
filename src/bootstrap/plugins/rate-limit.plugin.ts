import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import rateLimit from '@fastify/rate-limit';

// todo: use Redis storage for better consistency

export async function registerRateLimit(app: NestFastifyApplication) {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    hook: 'onRequest',
    skipOnError: false,
    allowList: (req) => req.method === 'OPTIONS', // preflight requests
    keyGenerator: (req) => req.ip,
    addHeaders: {
      'ratelimit-limit': true,
      'ratelimit-remaining': true,
      'ratelimit-reset': true,
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    errorResponseBuilder: (_req, ctx) => ({
      statusCode: ctx.statusCode ?? 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Retry in ${ctx.after}.`,
      details: { limit: ctx.max, resetMs: ctx.ttl, banned: ctx.ban === true },
    }),
  });
}
