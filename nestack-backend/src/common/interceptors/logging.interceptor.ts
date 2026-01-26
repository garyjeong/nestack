import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    const now = Date.now();

    this.logger.log(
      `→ ${method} ${url} [${controller}.${handler}] - ${ip} - ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          const statusCode = response.statusCode;
          const statusIcon = this.getStatusIcon(statusCode);

          this.logger.log(
            `← ${method} ${url} [${controller}.${handler}] ${statusIcon} ${statusCode} (${duration}ms)`,
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = error.status || 500;
          const statusIcon = this.getStatusIcon(statusCode);

          this.logger.error(
            `← ${method} ${url} [${controller}.${handler}] ${statusIcon} ${statusCode} (${duration}ms) - ${error.message}`,
          );
        },
      }),
    );
  }

  private getStatusIcon(status: number): string {
    if (status >= 200 && status < 300) return '✓';
    if (status >= 300 && status < 400) return '↪';
    if (status >= 400 && status < 500) return '✗';
    return '⚠';
  }
}
