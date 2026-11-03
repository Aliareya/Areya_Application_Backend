
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  User,
  SystemRole,
} from '../../api/users/entities/user.entity';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // 1. دریافت Permissionهای مورد نیاز API
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // اگر این Guard برای API هیچ Permission خاصی تعریف نکرده باشد،
    // بررسی Permission انجام نمی‌شود.
    if (
      !requiredPermissions ||
      requiredPermissions.length === 0
    ) {
      return true;
    }

    // 2. دریافت کاربر احراز هویت‌شده از JWT
    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;

    if (!jwtUser) {
      throw new UnauthorizedException(
        'لطفاً وارد حساب کاربری خود شوید.',
      );
    }

    // پشتیبانی از هر دو نام user_id و sub
    const userId = Number(
      jwtUser.user_id ?? jwtUser.sub,
    );

    if (
      !Number.isSafeInteger(userId) ||
      userId <= 0
    ) {
      throw new UnauthorizedException(
        'شناسه کاربر در توکن معتبر نیست.',
      );
    }

    // 3. دریافت اطلاعات تازه از دیتابیس
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        workshop: true,

        roleEntity: {
          workshop: true,

          rolePermissions: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'کاربر پیدا نشد.',
      );
    }

    // 4. ADMIN: دسترسی سراسری به تمام کارگاه‌ها
    if (user.systemRole === SystemRole.ADMIN) {
      return true;
    }

    // 5. USER: کاربر عادی اجازه دسترسی مدیریتی ندارد
    if (user.systemRole === SystemRole.USER) {
      throw new ForbiddenException(
        'برای انجام این عملیات باید عضو یک کارگاه باشید.',
      );
    }

    // 6. CUSTOMER: باید کارگاه و رول معتبر داشته باشد
    if (user.systemRole !== SystemRole.CUSTOMER) {
      throw new ForbiddenException(
        'نقش سیستم شما معتبر نیست.',
      );
    }

    if (!user.workshop || !user.roleEntity) {
      throw new ForbiddenException(
        'برای حساب شما کارگاه یا رول تعیین نشده است.',
      );
    }

    // 7. بررسی تعلق رول به کارگاه کاربر
    const userWorkshopId = user.workshop.id;
    const roleWorkshopId = user.roleEntity.workshop?.id;

    if (
      !roleWorkshopId ||
      roleWorkshopId !== userWorkshopId
    ) {
      throw new ForbiddenException(
        'این رول متعلق به کارگاه شما نیست.',
      );
    }

    // 8. جلوگیری از دسترسی به کارگاه دیگر از طریق URL
    const requestedWorkshopId =
      request.params?.workshopId;

    if (
      requestedWorkshopId !== undefined &&
      Number(requestedWorkshopId) !== userWorkshopId
    ) {
      throw new ForbiddenException(
        'شما اجازه دسترسی به این کارگاه را ندارید.',
      );
    }

    // 9. استخراج Permissionهای رول از دیتابیس
    const userPermissions = new Set(
      (user.roleEntity.rolePermissions ?? [])
        .map((item) => item.permission?.slug)
        .filter(
          (slug): slug is string =>
            typeof slug === 'string' &&
            slug.length > 0,
        ),
    );

    // 10. بررسی تمام Permissionهای مورد نیاز API
    const hasAllPermissions =
      requiredPermissions.every((permission) =>
        userPermissions.has(permission),
      );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'شما اجازه انجام این عملیات را ندارید.',
      );
    }

    return true;
  }
}
