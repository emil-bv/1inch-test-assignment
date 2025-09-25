import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';
import { IsEthereumAddress } from '@common/validators/ethereum-address.validator';
import { IsPositiveNumberString } from '@common/validators/positive-number-string.validator';

export class QuoteRequestDto {
  @ApiProperty({
    description: 'ERC20 address of the input token',
    example: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  })
  @IsEthereumAddress()
  fromTokenAddress!: string;

  @ApiProperty({
    description: 'ERC20 address of the output token',
    example: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  })
  @IsEthereumAddress()
  toTokenAddress!: string;

  @ApiProperty({
    description: 'Swap amount (human-readable string)',
    example: '1',
  })
  @IsPositiveNumberString()
  amountIn!: string;
}

class TokenAmount {
  @ApiProperty({
    description: 'Token address',
    example: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  })
  token!: string;

  @ApiProperty({
    description: 'Token decimals',
    example: 18,
  })
  decimals!: number;

  @ApiProperty({
    description: 'Amount in human-readable format',
    example: '1.0',
  })
  amountHuman!: string;

  @ApiProperty({
    description: 'Amount in raw units (wei-like)',
    example: '1000000000000000000',
  })
  amountRaw!: string;
}

class TokenMeta {
  @ApiProperty({ description: 'Token decimals', example: 18 })
  decimals!: number;

  @ApiPropertyOptional({ description: 'Token symbol', example: 'WETH' })
  symbol?: string;

  @ApiPropertyOptional({ description: 'Token name', example: 'Wrapped Ether' })
  name?: string;
}

// Let Swagger know about nested models we reference via $ref
@ApiExtraModels(TokenMeta, TokenAmount)
export class QuoteResponseDto {
  @ApiProperty({ description: 'Status of the quote', example: 'ok' })
  status!: string;

  @ApiProperty({
    description: 'Swap path (token addresses)',
    type: [String],
    example: [
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    ],
  })
  path!: string[];

  @ApiProperty({
    description: 'Pool address',
    example: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
  })
  pool!: string;

  @ApiProperty({ description: 'Input token amount', type: () => TokenAmount })
  input!: TokenAmount;

  @ApiProperty({ description: 'Output token amount', type: () => TokenAmount })
  output!: TokenAmount;

  @ApiProperty({
    description: 'Pool reserves by token address (raw units)',
    // dictionary<string, string>
    additionalProperties: {
      type: 'string',
      description: 'Reserve amount in raw units',
      example: '1000000000000000000',
    },
    example: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': '1000000000000000000',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '2000000000',
    },
  })
  reserves!: Record<string, string>;

  @ApiProperty({
    description: 'Token metadata by token address',
    // dictionary<string, TokenMeta> with $ref
    additionalProperties: {
      $ref: getSchemaPath(TokenMeta),
    },
    example: {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
        decimals: 18,
        symbol: 'WETH',
        name: 'Wrapped Ether',
      },
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
      },
    },
  })
  tokenMeta!: Record<string, TokenMeta>;
}
