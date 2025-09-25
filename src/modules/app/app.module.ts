import { Module } from '@nestjs/common';

import { EnvModule } from '@common/modules/env/env.module';
import { LoggerModule } from '@common/modules/logger/logger.module';
import { EthersModule } from '@common/modules/ethers/ethers.module';
import { AllExceptionsFilter } from '@common/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

import { HealthModule } from '@modules/health/health.module';
import { GasModule } from '@modules/gas/gas.module';
import { AmmModule } from '@modules/amm/amm.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    EnvModule,
    LoggerModule,
    EthersModule,
    HealthModule,
    GasModule,
    AmmModule,
  ],
  controllers: [AppController],
  providers: [AppService, AllExceptionsFilter, LoggingInterceptor],
  exports: [AllExceptionsFilter, LoggingInterceptor],
})
export class AppModule {}
