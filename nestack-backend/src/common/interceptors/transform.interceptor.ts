import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has pagination meta, preserve it
        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          return {
            success: true as const,
            data: data.data,
            meta: {
              timestamp: new Date().toISOString(),
              ...(data.meta.pagination && { pagination: data.meta.pagination }),
            },
          };
        }

        return {
          success: true as const,
          data,
          meta: {
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
