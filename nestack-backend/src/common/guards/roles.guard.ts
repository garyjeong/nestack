import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AdminRole } from '../enums';
import { BusinessException } from '../exceptions/business.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new BusinessException('ADMIN_001');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      if (requiredRoles.includes(AdminRole.SUPER_ADMIN)) {
        throw new BusinessException('ADMIN_002');
      }
      throw new BusinessException('ADMIN_001');
    }

    return true;
  }
}
