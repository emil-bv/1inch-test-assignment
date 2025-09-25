import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { EthersProviderService } from '@common/modules/ethers/ethers.service';

import { GasService } from '@modules/gas/gas.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly ethers: EthersProviderService,
    private readonly gasService: GasService,
  ) {}

  @ApiOperation({ summary: 'Health live check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health live status of the application',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Overall health status',
        },
      },
    },
  })
  @Get('live')
  @Version(VERSION_NEUTRAL)
  live() {
    return {
      status: 'ok',
    };
  }

  @ApiOperation({ summary: 'Health ready check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health ready status of the application',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Overall health status',
        },
        timestamp: {
          type: 'string',
          example: '2024-01-01T00:00:00.000Z',
          description: 'Timestamp of the health check',
        },
        ethereum: {
          type: 'object',
          properties: {
            connected: {
              type: 'boolean',
              example: true,
              description: 'Whether Ethereum connection is working',
            },
            chainId: {
              type: 'number',
              example: 1,
              description: 'Ethereum chain ID',
            },
          },
        },
        gasPrice: {
          type: 'object',
          properties: {
            ready: {
              type: 'boolean',
              example: true,
              description: 'Whether gas price cache is ready',
            },
            stale: {
              type: 'boolean',
              example: false,
              description: 'Whether gas price data is stale',
            },
          },
        },
      },
    },
  })
  @Get('ready')
  @Version(VERSION_NEUTRAL)
  async ready() {
    const timestamp = new Date().toISOString();
    let overallStatus = 'ok';

    // Check Ethereum connection
    const ethereum = await this.checkEthereum();
    if (!ethereum.connected) {
      overallStatus = 'degraded';
    }

    // Check gas price service
    const gasPrice = this.checkGasPrice();
    if (!gasPrice.ready || gasPrice.stale) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp,
      ethereum,
      gasPrice,
    };
  }

  private async checkEthereum() {
    try {
      const network = await this.ethers.provider.getNetwork();
      return {
        connected: true,
        chainId: network.chainId,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        connected: false,
        error: errorMessage,
      };
    }
  }

  private checkGasPrice() {
    const cached = this.gasService.getCached();
    return {
      ready: cached.ready,
      stale: cached.ready ? cached.stale : false,
    };
  }
}
