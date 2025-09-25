import { Global, Module } from '@nestjs/common';

import { LOGGER } from './logger.tokens';
import { PinoNestLoggerFactory } from './pino-nest-logger';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER,
      useFactory: () => {
        return PinoNestLoggerFactory();
      },
    },
  ],
  exports: [LOGGER],
})
export class LoggerModule {}
