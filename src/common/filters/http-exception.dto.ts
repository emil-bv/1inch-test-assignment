import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsString, IsEnum } from 'class-validator';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

export class HttpErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  @IsNumber()
  statusCode!: number;

  @ApiProperty({
    example: '2025-09-25T13:45:00.000Z',
    description: 'ISO8601 timestamp when error was generated',
  })
  @IsISO8601()
  timestamp!: string;

  @ApiProperty({
    example: '/amm/quote/0x.../0x...',
    description: 'Original request URL',
  })
  @IsString()
  path!: string;

  @ApiProperty({
    enum: HttpMethod,
    example: HttpMethod.GET,
    description: 'HTTP method',
  })
  @IsEnum(HttpMethod)
  method!: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Human-readable error message',
  })
  @IsString()
  message!: string;
}
