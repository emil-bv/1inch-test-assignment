import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

import { EthersModule } from '@common/modules/ethers/ethers.module';

import { GasModule } from '@modules/gas/gas.module';

@Module({
  imports: [EthersModule, GasModule],
  controllers: [HealthController],
})
export class HealthModule {}
