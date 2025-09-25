import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { BigNumber, Contract, utils } from 'ethers';

import { EthersProviderService } from '@common/modules/ethers/ethers.service';
import { ENV, type EnvService } from '@tokens';

import {
  UNISWAP_V2_FACTORY_ABI,
  UNISWAP_V2_PAIR_ABI,
  ERC20_MIN_ABI,
} from './abi';

type TokenMeta = { decimals: number; symbol?: string; name?: string };

interface IUniswapV2Factory {
  getPair(a: string, b: string): Promise<string>;
}
interface IUniswapV2Pair {
  token0(): Promise<string>;
  token1(): Promise<string>;
  getReserves(): Promise<[BigNumber, BigNumber, number]>;
}
interface IERC20Minimal {
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  name(): Promise<string>;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const FEE_MUL = BigNumber.from(997); // uniswap fee numerator
const FEE_DIV = BigNumber.from(1000); // uniswap fee denominator

const norm = (addr: string) => utils.getAddress(addr);

@Injectable()
export class UniswapV2Service {
  private readonly factoryAddress: string;
  private readonly tokenMetaCache = new Map<string, TokenMeta>();
  private readonly pairCache = new Map<string, string>();

  constructor(
    @Inject(ENV) private readonly env: EnvService,
    private readonly ethers: EthersProviderService,
  ) {
    this.factoryAddress = norm(this.env.uniswapV2Factory);
  }

  // deterministic key for a pair (order independent)
  private keyFor(a: string, b: string) {
    const [x, y] = [norm(a), norm(b)].sort();
    return `${x}-${y}`;
  }

  // resolve pair address from factory (with cache)
  private async getPairAddress(a: string, b: string): Promise<string> {
    const key = this.keyFor(a, b);
    const cached = this.pairCache.get(key);
    if (cached) return cached;

    try {
      const factory = new Contract(
        this.factoryAddress,
        UNISWAP_V2_FACTORY_ABI,
        this.ethers.provider,
      ) as unknown as IUniswapV2Factory;

      const pair = await factory.getPair(a, b);
      if (!pair || pair.toLowerCase() === ZERO_ADDRESS) {
        throw new BadRequestException('Pair does not exist on Uniswap V2');
      }
      const normalized = norm(pair);
      this.pairCache.set(key, normalized);
      return normalized;
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      const msg = e instanceof Error ? e.message : 'Unknown error';
      throw new BadRequestException(`Failed to get pair address: ${msg}`);
    }
  }

  // fetch token0, token1 and reserves
  private async getReserves(pairAddr: string) {
    try {
      const pair = new Contract(
        pairAddr,
        UNISWAP_V2_PAIR_ABI,
        this.ethers.provider,
      ) as unknown as IUniswapV2Pair;

      const [t0, t1, [r0, r1]] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.getReserves(),
      ]);

      return {
        token0: norm(t0),
        token1: norm(t1),
        r0,
        r1,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      throw new BadRequestException(`Failed to get reserves: ${msg}`);
    }
  }

  // fetch decimals/symbol/name (with cache)
  private async getTokenMeta(addr: string): Promise<TokenMeta> {
    const a = norm(addr);
    const cached = this.tokenMetaCache.get(a);
    if (cached) return cached;

    try {
      const c = new Contract(
        a,
        ERC20_MIN_ABI,
        this.ethers.provider,
      ) as unknown as IERC20Minimal;

      const decimals = await c.decimals();
      let symbol: string | undefined;
      let name: string | undefined;

      try {
        symbol = await c.symbol();
      } catch {}
      try {
        name = await c.name();
      } catch {}

      const meta: TokenMeta = { decimals, symbol, name };
      this.tokenMetaCache.set(a, meta);
      return meta;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to get token metadata for ${addr}: ${msg}`,
      );
    }
  }

  // uniswap v2 formula: (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
  private getAmountOut(
    amountIn: BigNumber,
    reserveIn: BigNumber,
    reserveOut: BigNumber,
  ): BigNumber {
    if (amountIn.isZero()) return BigNumber.from(0);
    const xFee = amountIn.mul(FEE_MUL);
    const num = xFee.mul(reserveOut);
    const den = reserveIn.mul(FEE_DIV).add(xFee);
    return num.div(den);
  }

  // main quote method
  async quoteExactInput(from: string, to: string, amountInHuman: string) {
    if (!utils.isAddress(from) || !utils.isAddress(to)) {
      throw new BadRequestException('Invalid token address');
    }
    const fromN = norm(from);
    const toN = norm(to);
    if (fromN === toN) {
      throw new BadRequestException('from and to must differ');
    }
    if (!/^\d+(\.\d+)?$/.test(amountInHuman)) {
      throw new BadRequestException(
        'amountIn must be a positive number string',
      );
    }

    // 1) pair address
    const pairAddr = await this.getPairAddress(fromN, toN);

    // 2) reserves
    const { token0, token1, r0, r1 } = await this.getReserves(pairAddr);

    // 3) token metadata
    const [fromMeta, toMeta] = await Promise.all([
      this.getTokenMeta(fromN),
      this.getTokenMeta(toN),
    ]);

    // 4) figure out in/out reserves
    const isFromToken0 = token0 === fromN;
    const isFromToken1 = token1 === fromN;
    const reserveIn = isFromToken0
      ? r0
      : isFromToken1
        ? r1
        : token0 === toN
          ? r1
          : r0;
    const reserveOut = isFromToken0
      ? r1
      : isFromToken1
        ? r0
        : token0 === toN
          ? r0
          : r1;

    // 5) parse human input to raw units
    const amountIn = utils.parseUnits(amountInHuman, fromMeta.decimals);
    if (amountIn.lte(0)) {
      throw new BadRequestException('amountIn must be > 0');
    }

    // 6) calculate output
    const amountOut = this.getAmountOut(amountIn, reserveIn, reserveOut);

    // 7) format result
    const amountOutHuman = utils.formatUnits(amountOut, toMeta.decimals);

    return {
      status: 'ok',
      path: [fromN, toN],
      pool: pairAddr,
      input: {
        token: fromN,
        decimals: fromMeta.decimals,
        amountHuman: amountInHuman,
        amountRaw: amountIn.toString(),
      },
      output: {
        token: toN,
        decimals: toMeta.decimals,
        amountHuman: amountOutHuman,
        amountRaw: amountOut.toString(),
      },
      reserves: {
        [token0]: r0.toString(),
        [token1]: r1.toString(),
      },
      tokenMeta: {
        [fromN]: fromMeta,
        [toN]: toMeta,
      },
    };
  }
}
