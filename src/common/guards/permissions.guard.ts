import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator';
import { SystemRole } from '../../api/users/entities/user.entity';


@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. بررسی احراز هویت
    if (!user) {
      throw new UnauthorizedException(
        'برای دسترسی به این بخش ابتدا وارد حساب کاربری شوید.',
      );
    }

    // 2. دریافت Permissionهای موردنیاز API
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // API بدون محدودیت Permission
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 3. دسترسی مدیریتی SUPER_ADMIN و OWNER
    // کنترل مالکیت منابع همچنان باید در Service انجام شود.
    if (
      user.systemRole === SystemRole.SUPER_ADMIN ||
      user.systemRole === SystemRole.OWNER
    ) {
      return true;
    }

    // 4. بررسی Permissionهای کاربر
    const userPermissions: string[] = Array.isArray(user.permissions)
      ? user.permissions
          .map((permission: any) =>
            typeof permission === 'string' ? permission : permission?.slug,
          )
          .filter((slug: unknown): slug is string => typeof slug === 'string')
      : [];

    // 5. بررسی تمام Permissionهای موردنیاز
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'شما مجوز لازم برای انجام این عملیات را ندارید.',
      );
    }

    return true;
  }
}
