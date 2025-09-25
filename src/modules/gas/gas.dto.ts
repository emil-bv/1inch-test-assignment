import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class GasPriceWarmingDto {
  @ApiProperty({
    example: 'warming_up',
    description: 'Cache status',
    enum: ['warming_up'],
  })
  status!: 'warming_up';
}

export class GasPriceReadyDto {
  @ApiProperty({
    example: 'ok',
    description: 'Cache status',
    enum: ['ok'],
  })
  status!: 'ok';

  @ApiProperty({ example: true, description: 'Whether cache is ready' })
  ready!: true;

  @ApiProperty({
    example: '20000000000',
    description: 'Gas price in wei (string)',
  })
  wei!: string;

  @ApiProperty({
    example: '20.0',
    description: 'Gas price in gwei (string for UI)',
  })
  gwei!: string;

  @ApiProperty({
    example: 1695568000000,
    description: 'Last update timestamp (ms since epoch)',
  })
  updatedAt!: number;

  @ApiProperty({
    example: false,
    description: 'True if value is older than staleMs',
  })
  stale!: boolean;
}

@ApiExtraModels(GasPriceWarmingDto, GasPriceReadyDto)
export class GasDtoModels {}
