import { Module } from '@nestjs/common';

import { EthersModule } from '@common/modules/ethers/ethers.module';

import { GasService } from './gas.service';
import { GasController } from './gas.controller';

@Module({
  imports: [EthersModule],
  controllers: [GasController],
  providers: [GasService],
  exports: [GasService],
})
export class GasModule {}
