
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { SystemRole } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  // Check owner access to shop
  private async checkShopOwnership(
    actorId: string,
    shopId: string,
  ): Promise<Shop> {
    const user = await this.userRepository.findOne({
      where: { id: actorId },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('حساب کاربری شما غیرفعال است.');
    }

    if (user.systemRole !== SystemRole.OWNER) {
      throw new ForbiddenException(
        'فقط مالک فروشگاه اجازه مدیریت نقش‌ها را دارد.',
      );
    }

    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      relations: {
        store: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('دکان مورد نظر پیدا نشد.');
    }

    if (shop.store.ownerId !== user.id) {
      throw new ForbiddenException(
        'شما اجازه دسترسی به این دکان را ندارید.',
      );
    }

    return shop;
  }

  // Create role
  async create(
    actorId: string,
    shopId: string,
    createRoleDto: CreateRoleDto,
  ) {
    await this.checkShopOwnership(actorId, shopId);

    const name = createRoleDto.name.trim();
    const slug = createRoleDto.slug.trim().toLowerCase();

    if (!name || !slug) {
      throw new BadRequestException(
        'نام و شناسه نقش نمی‌توانند خالی باشند.',
      );
    }

    const existingRole = await this.roleRepository.findOne({
      where: {
        shopId,
        slug,
      },
    });

    if (existingRole) {
      throw new ConflictException(
        'این شناسه نقش قبلاً در این دکان ثبت شده است.',
      );
    }

    const role = this.roleRepository.create({
      shopId,
      name,
      slug,
      description: createRoleDto.description?.trim() || null,
    });

    try {
      const savedRole = await this.roleRepository.save(role);

      return {
        success: true,
        message: 'نقش با موفقیت ایجاد شد.',
        role: savedRole,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'این شناسه نقش قبلاً در این دکان ثبت شده است.',
        );
      }

      throw error;
    }
  }

  // Get all roles of a shop
  async findAll(actorId: string, shopId: string) {
    await this.checkShopOwnership(actorId, shopId);

    return this.roleRepository.find({
      where: { shopId },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get one role
  async findOne(
    actorId: string,
    shopId: string,
    id: string,
  ) {
    await this.checkShopOwnership(actorId, shopId);

    const role = await this.roleRepository.findOne({
      where: {
        id,
        shopId,
      },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException('نقش مورد نظر پیدا نشد.');
    }

    return role;
  }

  // Update role
  async update(
    actorId: string,
    shopId: string,
    id: string,
    updateRoleDto: UpdateRoleDto,
  ) {
    await this.checkShopOwnership(actorId, shopId);

    if (Object.keys(updateRoleDto).length === 0) {
      throw new BadRequestException(
        'حداقل یک فیلد برای ویرایش ارسال کنید.',
      );
    }

    const role = await this.roleRepository.findOne({
      where: {
        id,
        shopId,
      },
    });

    if (!role) {
      throw new NotFoundException('نقش مورد نظر پیدا نشد.');
    }

    if (updateRoleDto.name !== undefined) {
      const name = updateRoleDto.name.trim();

      if (!name) {
        throw new BadRequestException(
          'نام نقش نمی‌تواند خالی باشد.',
        );
      }

      role.name = name;
    }

    if (updateRoleDto.slug !== undefined) {
      const slug = updateRoleDto.slug.trim().toLowerCase();

      if (!slug) {
        throw new BadRequestException(
          'شناسه نقش نمی‌تواند خالی باشد.',
        );
      }

      const existingRole = await this.roleRepository.findOne({
        where: {
          shopId,
          slug,
        },
      });

      if (existingRole && existingRole.id !== role.id) {
        throw new ConflictException(
          'این شناسه قبلاً برای نقش دیگری در این دکان استفاده شده است.',
        );
      }

      role.slug = slug;
    }

    if (updateRoleDto.description !== undefined) {
      role.description =
        updateRoleDto.description?.trim() || null;
    }

    try {
      const updatedRole = await this.roleRepository.save(role);

      return {
        success: true,
        message: 'نقش با موفقیت ویرایش شد.',
        role: updatedRole,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'این شناسه قبلاً برای نقش دیگری در این دکان استفاده شده است.',
        );
      }

      throw error;
    }
  }

  // Delete role
  async remove(
    actorId: string,
    shopId: string,
    id: string,
  ) {
    await this.checkShopOwnership(actorId, shopId);

    const role = await this.roleRepository.findOne({
      where: {
        id,
        shopId,
      },
    });

    if (!role) {
      throw new NotFoundException('نقش مورد نظر پیدا نشد.');
    }

    const assignedUsers = await this.userRoleRepository.count({
      where: {
        roleId: role.id,
        shopId,
      },
    });

    if (assignedUsers > 0) {
      throw new ConflictException(
        'این نقش به کارمندان اختصاص داده شده است و قابل حذف نیست.',
      );
    }

    await this.roleRepository.remove(role);

    return {
      success: true,
      message: 'نقش با موفقیت حذف شد.',
    };
  }
}
