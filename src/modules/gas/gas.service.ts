import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { BigNumber, utils } from 'ethers';

import { EthersProviderService } from '@common/modules/ethers/ethers.service';
import { LOGGER, type LoggerService } from '@tokens';

type GasPriceCache =
  | { ready: false }
  | {
      ready: true;
      wei: string;
      gwei: string;
      updatedAt: number;
      stale: boolean;
    };

@Injectable()
export class GasService implements OnModuleInit, OnModuleDestroy {
  private lastWei: BigNumber | null = null; // cached gas price
  private lastTs = 0; // last update timestamp

  // pollMs: trade-off between freshness and RPC load
  // staleMs: even if delayed, we can respond quickly with a 'stale' flag
  private readonly pollMs = 3000;
  private readonly staleMs = 60_000;

  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly ethers: EthersProviderService,
    @Inject(LOGGER) private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    // 1) warm up cache on startup
    try {
      await this.refresh();
    } catch {
      // ignore; next tick will retry
    }
    // 2) background refresh loop
    this.intervalId = setInterval(() => {
      void this.refresh().catch(() => {
        // already logged inside refresh
      });
    }, this.pollMs);
  }

  onModuleDestroy() {
    // prevent leaks (tests/hot-reload)
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  // Refresh gas price from RPC and update in-memory cache
  private async refresh() {
    try {
      this.lastWei = await this.ethers.provider.getGasPrice();
      this.lastTs = Date.now();
    } catch (err) {
      const msg =
        err instanceof Error ? (err.stack ?? err.message) : String(err);
      this.logger.error({ err: msg }, 'Failed to refresh gas price');
      // keep previous cache on failure
    }
  }

  // Return cached value only (no RPC call here)
  getCached(): GasPriceCache {
    if (!this.lastWei) return { ready: false };
    const stale = Date.now() - this.lastTs > this.staleMs;
    return {
      ready: true,
      wei: this.lastWei.toString(),
      gwei: utils.formatUnits(this.lastWei, 'gwei'),
      updatedAt: this.lastTs,
      stale,
    };
  }
}
