import { Module } from '@nestjs/common';

import { EthersModule } from '@common/modules/ethers/ethers.module';

import { AmmController } from './amm.controller';
import { UniswapV2Service } from './uniswap-v2.service';

@Module({
  imports: [EthersModule],
  controllers: [AmmController],
  providers: [UniswapV2Service],
})
export class AmmModule {}
