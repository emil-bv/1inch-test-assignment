import { Injectable, Inject } from '@nestjs/common';
import { providers } from 'ethers';

import { ENV, type EnvService } from '@tokens';

@Injectable()
export class EthersProviderService {
  public readonly provider: providers.JsonRpcProvider;

  constructor(@Inject(ENV) private readonly env: EnvService) {
    this.provider = new providers.JsonRpcProvider(this.env.ethRpcUrl);
  }
}
