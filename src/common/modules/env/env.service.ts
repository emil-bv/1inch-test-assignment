import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private readonly cfg: ConfigService) {}

  get nodeEnv() {
    return this.cfg.get<string>('NODE_ENV')!;
  }

  get isProd() {
    return this.nodeEnv === 'production';
  }
  get isDev() {
    return this.nodeEnv === 'development';
  }
  get isTest() {
    return this.nodeEnv === 'test';
  }

  get port() {
    return this.cfg.get<number>('PORT', 3000);
  }

  get apiPrefix() {
    return this.cfg.get<string>('API_PREFIX', 'api');
  }
  get apiVersion() {
    return this.cfg.get<string>('API_VERSION', '1');
  }
  get apiBasePath() {
    return `/${this.apiPrefix}/v${this.apiVersion}`;
  }

  get uniswapV2Factory() {
    const val = this.cfg.get<string>('UNISWAP_V2_FACTORY');
    if (!val) throw new Error('UNISWAP_V2_FACTORY is not set');
    return val;
  }

  get chainId() {
    const val = this.cfg.get<number>('CHAIN_ID');
    if (!val) throw new Error('CHAIN_ID is not set');
    return val;
  }

  get ethRpcUrl() {
    const val = this.cfg.get<string>('ETH_RPC_URL');
    if (!val) throw new Error('ETH_RPC_URL is not set');
    return val;
  }
}
