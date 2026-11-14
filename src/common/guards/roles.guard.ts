
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorator/roles.decorator';
import { SystemRole } from '../../api/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // کاربر باید ابتدا احراز هویت شده باشد.
    if (!user) {
      throw new UnauthorizedException(
        'برای دسترسی به این بخش ابتدا وارد حساب کاربری شوید.',
      );
    }

    // نقش‌های موردنیاز مسیر
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // SUPER_ADMIN و OWNER از بررسی عادی نقش‌ها معاف هستند.
    if (
      user.systemRole === SystemRole.SUPER_ADMIN ||
      user.systemRole === SystemRole.OWNER
    ) {
      return true;
    }

    // اگر برای مسیر نقشی تعیین نشده باشد.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // بررسی نقش کاربر
    if (!requiredRoles.includes(user.systemRole)) {
      throw new ForbiddenException(
        'شما اجازه دسترسی به این بخش را ندارید.',
      );
    }

    return true;
  }
}
