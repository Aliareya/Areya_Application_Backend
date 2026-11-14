
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { SystemRole } from '../../api/users/entities/user.entity';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'برای دسترسی ابتدا وارد حساب کاربری شوید.',
      );
    }

    if (user.systemRole !== SystemRole.OWNER) {
      throw new ForbiddenException(
        'فقط مالک فروشگاه اجازه دسترسی به این بخش را دارد.',
      );
    }

    return true;
  }
}
