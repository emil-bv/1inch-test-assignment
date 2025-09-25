import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

import { LOGGER } from '@tokens';

import type { HttpErrorResponseDto } from './http-exception.dto';

type NestErrorResponse = {
  message: string;
  statusCode?: number;
  error?: string;
};

@Injectable()
@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER) private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as
        | NestErrorResponse
        | string;
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || 'Bad Request';
    } else {
      message = 'Internal server error';
    }

    // Log the error
    this.logger.error(
      {
        method: request.method,
        url: request.url,
        statusCode: status,
        error: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      'HTTP Exception',
    );

    const errorResponse: HttpErrorResponseDto = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    void response.status(status).send(errorResponse);
  }
}
