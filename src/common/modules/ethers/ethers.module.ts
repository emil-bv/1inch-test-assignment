import { Module } from '@nestjs/common';
import { EthersProviderService } from './ethers.service';

@Module({
  providers: [EthersProviderService],
  exports: [EthersProviderService],
})
export class EthersModule {}
