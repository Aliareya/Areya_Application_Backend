import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, SystemRole } from '../../api/users/entities/user.entity';

import { Store } from '../../api/stores/entities/store.entity';
import { Shop } from '../../api/shops/entities/shop.entity';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async validateStoreShopAccess(
    userId: string,
    storeId: string,
    shopId?: string,
  ): Promise<void> {
    if (
      !/^[1-9]\d*$/.test(userId) ||
      !/^[1-9]\d*$/.test(storeId) ||
      (shopId !== undefined && !/^[1-9]\d*$/.test(shopId))
    ) {
      throw new BadRequestException('شناسه واردشده معتبر نیست.');
    }

    // 2. دریافت کاربر
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'systemRole', 'shopId', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('حساب کاربری شما غیرفعال است.');
    }

    // 3. دریافت فروشگاه
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      select: ['id', 'ownerId'],
    });

    if (!store) {
      throw new NotFoundException('فروشگاه یافت نشد.');
    }

    // 4. بررسی SUPER_ADMIN
    if (user.systemRole === SystemRole.SUPER_ADMIN) {
      if (shopId) {
        const shop = await this.shopRepository.findOne({
          where: { id: shopId, storeId },
          select: ['id', 'storeId'],
        });

        if (!shop) {
          throw new NotFoundException('دکان در این فروشگاه یافت نشد.');
        }
      }

      return;
    }

    // 5. بررسی OWNER
    if (user.systemRole === SystemRole.OWNER) {
      if (store.ownerId !== user.id) {
        throw new ForbiddenException('شما به این فروشگاه دسترسی ندارید.');
      }

      if (shopId) {
        const shop = await this.shopRepository.findOne({
          where: { id: shopId, storeId },
          select: ['id', 'storeId'],
        });

        if (!shop) {
          throw new NotFoundException('دکان در این فروشگاه یافت نشد.');
        }
      }

      return;
    }

    // 6. بررسی EMPLOYEE و STUDENT
    if (
      user.systemRole === SystemRole.EMPLOYEE ||
      user.systemRole === SystemRole.STUDENT
    ) {
      if (!user.shopId) {
        throw new ForbiddenException('برای شما هیچ دکانی تعیین نشده است.');
      }

      if (shopId && user.shopId !== shopId) {
        throw new ForbiddenException('شما به این دکان دسترسی ندارید.');
      }

      const assignedShop = await this.shopRepository.findOne({
        where: {
          id: user.shopId,
          storeId,
        },
        select: ['id', 'storeId'],
      });

      if (!assignedShop) {
        throw new ForbiddenException(
          'دکان تعیین‌شده متعلق به این فروشگاه نیست.',
        );
      }

      return;
    }

    throw new ForbiddenException('شما اجازه دسترسی به این منبع را ندارید.');
  }

  async validateUserAccess(
    actorId: string,
    targetUserId: string,
  ): Promise<boolean> {
    // 1. دریافت کاربر درخواست‌کننده
    const actor = await this.userRepository.findOne({
      where: { id: actorId },
      select: {
        id: true,
        systemRole: true,
        shopId: true,
        isActive: true,
      },
    });

    if (!actor || !actor.isActive) {
      throw new UnauthorizedException('کاربر درخواست‌کننده معتبر نیست');
    }

    // 2. دریافت کاربر هدف
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
      select: {
        id: true,
        shopId: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('کاربر موردنظر یافت نشد');
    }

    // 3. اگر کاربر درخواست‌کننده خودش باشد
    if (String(actor.id) === String(targetUser.id)) {
      return true;
    }

    // 4. دسترسی کامل Super Admin
    if (actor.systemRole === SystemRole.SUPER_ADMIN) {
      return true;
    }

    // 5. بررسی دسترسی Owner
    if (actor.systemRole === SystemRole.OWNER) {
      // پیدا کردن Store متعلق به Owner
      const store = await this.storeRepository.findOne({
        where: {
          ownerId: actor.id,
        },
        select: {
          id: true,
        },
      });

      if (!store) {
        throw new ForbiddenException('شما فروشگاه معتبری ندارید');
      }

      // کاربر هدف باید در یکی از دکان‌های همین Store باشد
      if (!targetUser.shopId) {
        throw new ForbiddenException(
          'این کاربر به دکان متعلق به شما اختصاص ندارد',
        );
      }

      const targetShop = await this.shopRepository.findOne({
        where: {
          id: targetUser.shopId,
          storeId: store.id,
        },
        select: {
          id: true,
        },
      });

      if (!targetShop) {
        throw new ForbiddenException('شما اجازه دسترسی به این کاربر را ندارید');
      }

      return true;
    }

    // 6. بررسی دسترسی Employee و Student
    if (
      actor.systemRole === SystemRole.EMPLOYEE ||
      actor.systemRole === SystemRole.STUDENT
    ) {
      // هر دو باید به یک دکان اختصاص داشته باشند
      if (
        !actor.shopId ||
        !targetUser.shopId ||
        String(actor.shopId) !== String(targetUser.shopId)
      ) {
        throw new ForbiddenException('شما اجازه دسترسی به این کاربر را ندارید');
      }

      return true;
    }

    // 7. سایر نقش‌ها فقط به پروفایل خودشان دسترسی دارند
    throw new ForbiddenException(
      'شما اجازه دسترسی به پروفایل این کاربر را ندارید',
    );
  }

  async validateStoreAccess() {}

  async validateShopAccess(userId: string, shopId: string) {
    if (!/^[1-9]\d*$/.test(userId) || !/^[1-9]\d*$/.test(shopId)) {
      throw new BadRequestException('شناسه واردشده معتبر نیست.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'systemRole', 'shopId', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('حساب کاربری شما غیرفعال است.');
    }
  }

  async;
}
