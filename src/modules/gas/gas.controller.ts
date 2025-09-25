import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';

import { GasService } from './gas.service';
import { GasPriceWarmingDto, GasPriceReadyDto } from './gas.dto';

@ApiTags('gas')
@ApiExtraModels(GasPriceWarmingDto, GasPriceReadyDto)
@Controller('gas')
export class GasController {
  constructor(private readonly gas: GasService) {}

  @ApiOperation({ summary: 'Get current gas price (cached)' })
  @ApiResponse({
    status: 200,
    description: 'Returns cached gas price or warming-up status',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(GasPriceWarmingDto) },
        { $ref: getSchemaPath(GasPriceReadyDto) },
      ],
    },
  })
  @Get('price')
  getGasPrice(): GasPriceWarmingDto | GasPriceReadyDto {
    // IMPORTANT: no network calls here — only in-memory cache
    const res = this.gas.getCached();

    if (!res.ready) {
      // On cold start (or RPC failure) the cache may be empty.
      return { status: 'warming_up' };
    }

    return {
      status: 'ok',
      ready: true,
      wei: res.wei,
      gwei: res.gwei,
      updatedAt: res.updatedAt,
      stale: res.stale,
    };
  }
}
