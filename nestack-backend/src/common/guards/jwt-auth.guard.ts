import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_ROUTE_KEY } from '../decorators/admin-route.decorator';
import { BusinessException } from '../exceptions/business.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Skip for admin routes - they use their own AdminJwtGuard
    const isAdminRoute = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAdminRoute) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
  ): TUser {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new BusinessException('AUTH_001');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new BusinessException('AUTH_002');
      }
      throw new BusinessException('AUTH_003');
    }

    return user;
  }
}
