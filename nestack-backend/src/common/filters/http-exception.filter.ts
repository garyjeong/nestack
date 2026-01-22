import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'COMMON_003';
    let message = '서버 내부 오류가 발생했습니다.';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseBody = exceptionResponse as Record<string, unknown>;
        code = (responseBody.code as string) || this.getDefaultCode(status);
        message = (responseBody.message as string) || exception.message;
        details = responseBody.details as Record<string, unknown>;

        // Handle validation errors from class-validator
        if (Array.isArray(responseBody.message)) {
          message = responseBody.message.join(', ');
          code = 'COMMON_002';
        }
      } else {
        message = exceptionResponse as string;
      }
    }

    // Log error for non-client errors
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(errorResponse);
  }

  private getDefaultCode(status: number): string {
    switch (status) {
      case 400:
        return 'COMMON_001';
      case 401:
        return 'AUTH_003';
      case 403:
        return 'AUTH_006';
      case 404:
        return 'USER_003';
      case 429:
        return 'COMMON_004';
      default:
        return 'COMMON_003';
    }
  }
}
