import { LoggerService } from '@nestjs/common';
import pino, { Logger, Logger as Pino } from 'pino';

import { LoggerOptions } from 'pino';

export type PinoOptions = LoggerOptions & {
  transport?: {
    target: string;
    options?: Record<string, any>;
  };
};

export function buildPinoOptions(): PinoOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const level = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

  return isProd
    ? { level } // prod: pure JSON
    : {
        level,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      };
}

export function PinoNestLoggerFactory(): PinoNestLogger {
  const instance: Logger = pino(buildPinoOptions());
  return new PinoNestLogger(instance);
}

export class PinoNestLogger implements LoggerService {
  constructor(private pino: Pino) {}
  log(msg: any, ctx?: string) {
    this.pino.info({ ctx }, msg);
  }
  error(msg: any, trace?: string, ctx?: string) {
    this.pino.error({ ctx, trace }, msg);
  }
  warn(msg: any, ctx?: string) {
    this.pino.warn({ ctx }, msg);
  }
  debug(msg: any, ctx?: string) {
    this.pino.debug({ ctx }, msg);
  }
  verbose(msg: any, ctx?: string) {
    this.pino.trace({ ctx }, msg);
  }
}
