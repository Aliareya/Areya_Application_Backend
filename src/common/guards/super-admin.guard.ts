
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { SystemRole } from '../../api/users/entities/user.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'برای دسترسی ابتدا وارد حساب کاربری شوید.',
      );
    }

    if (user.systemRole !== SystemRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'فقط مدیر کل سیستم اجازه دسترسی به این بخش را دارد.',
      );
    }

    return true;
  }
}
