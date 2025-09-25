import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UniswapV2Service } from './uniswap-v2.service';
import { QuoteRequestDto, QuoteResponseDto } from './quote.dto';

@ApiTags('amm')
@Controller('amm')
export class AmmController {
  constructor(private readonly uni: UniswapV2Service) {}

  @ApiOperation({ summary: 'Get quote for a token swap' })
  @ApiParam({
    name: 'fromTokenAddress',
    description: 'ERC20 address of the input token',
    example: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  })
  @ApiParam({
    name: 'toTokenAddress',
    description: 'ERC20 address of the output token',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  })
  @ApiParam({
    name: 'amountIn',
    description: 'Swap amount (human-readable string)',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote result',
    type: QuoteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @Get('quote/:fromTokenAddress/:toTokenAddress/:amountIn')
  async getQuote(
    @Param() { fromTokenAddress, toTokenAddress, amountIn }: QuoteRequestDto,
  ): Promise<QuoteResponseDto> {
    return this.uni.quoteExactInput(fromTokenAddress, toTokenAddress, amountIn);
  }
}
