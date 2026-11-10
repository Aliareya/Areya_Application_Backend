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
import { Shop, ShopStatus } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { SystemRole } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';

import { RolePermission } from './entities/role-permission.entity';
import { PermissionsService } from '../permissions/permissions.service';

import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';

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
    private readonly dataSource: DataSource,

    private readonly permissionsService: PermissionsService,
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
      throw new ForbiddenException('شما اجازه دسترسی به این دکان را ندارید.');
    }

    if (shop.status === ShopStatus.INACTIVE) {
      throw new ForbiddenException(
        'دکان غیرفعال است و امکان مدیریت نقش‌ها وجود ندارد.',
      );
    }

    return shop;
  }

  // Create role with permissions
  async create(actorId: string, shopId: string, createRoleDto: CreateRoleDto) {
    // Check shop ownership
    await this.checkShopOwnership(actorId, shopId);

    const name = createRoleDto.name.trim();
    const slug = createRoleDto.slug.trim().toLowerCase();

    const permissionIds = [...new Set(createRoleDto.permissionIds ?? [])];

    if (!name || !slug) {
      throw new BadRequestException('نام و شناسه نقش نمی‌توانند خالی باشند.');
    }

    // Check duplicate role slug
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

    // Validate permissions
    if (permissionIds.length > 0) {
      const allPermissions = await this.permissionsService.findAll();

      const validPermissionIds = new Set(
        allPermissions.map((permission) => permission.id),
      );

      const invalidPermissionIds = permissionIds.filter(
        (permissionId) => !validPermissionIds.has(permissionId),
      );

      if (invalidPermissionIds.length > 0) {
        throw new BadRequestException('یک یا چند شناسه دسترسی معتبر نیست.');
      }
    }

    try {
      // Create role and assign permissions transactionally
      const savedRole = await this.dataSource.transaction(async (manager) => {
        const roleRepository = manager.getRepository(Role);

        const rolePermissionRepository = manager.getRepository(RolePermission);

        // Create role
        const role = roleRepository.create({
          shopId,
          name,
          slug,
          description: createRoleDto.description?.trim() || null,
        });

        const savedRole = await roleRepository.save(role);

        // Assign permissions
        if (permissionIds.length > 0) {
          const rolePermissions = permissionIds.map((permissionId) =>
            rolePermissionRepository.create({
              roleId: savedRole.id,
              permissionId,
            }),
          );

          await rolePermissionRepository.save(rolePermissions);
        }

        return savedRole;
      });

      // Return created role with permissions
      const roleWithPermissions = await this.roleRepository.findOne({
        where: {
          id: savedRole.id,
          shopId,
        },
        relations: {
          rolePermissions: {
            permission: true,
          },
        },
      });

      return {
        success: true,
        message: 'نقش و دسترسی‌های آن با موفقیت ایجاد شدند.',
        role: roleWithPermissions,
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
  async findOne(actorId: string, shopId: string, id: string) {
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

  // Get permissions of a role
  async findPermissions(actorId: string, shopId: string, roleId: string) {
    const role = await this.findOne(actorId, shopId, roleId);

    return {
      roleId: role.id,
      roleName: role.name,
      permissions: role.rolePermissions.map(
        (rolePermission) => rolePermission.permission,
      ),
    };
  }

  // Assign or replace role permissions
  async assignPermissions(
    actorId: string,
    shopId: string,
    roleId: string,
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    await this.checkShopOwnership(actorId, shopId);

    // Check permissions exist in the global permissions table
    const allPermissions = await this.permissionsService.findAll();

    const validPermissionIds = new Set(
      allPermissions.map((permission) => permission.id),
    );

    const invalidPermissionIds = assignRolePermissionsDto.permissionIds.filter(
      (permissionId) => !validPermissionIds.has(permissionId),
    );

    if (invalidPermissionIds.length > 0) {
      throw new BadRequestException('یک یا چند شناسه دسترسی معتبر نیست.');
    }

    // Replace permissions inside a transaction
    await this.dataSource.transaction(async (manager) => {
      const roleRepository = manager.getRepository(Role);
      const rolePermissionRepository = manager.getRepository(RolePermission);

      const role = await roleRepository.findOne({
        where: {
          id: roleId,
          shopId,
        },
      });

      if (!role) {
        throw new NotFoundException('نقش مورد نظر پیدا نشد.');
      }

      // Remove previous permissions
      await rolePermissionRepository.delete({
        roleId: role.id,
      });

      // Save new permissions
      if (assignRolePermissionsDto.permissionIds.length > 0) {
        const rolePermissions = assignRolePermissionsDto.permissionIds.map(
          (permissionId) =>
            rolePermissionRepository.create({
              roleId: role.id,
              permissionId,
            }),
        );

        await rolePermissionRepository.save(rolePermissions);
      }
    });

    return this.findPermissions(actorId, shopId, roleId);
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
      throw new BadRequestException('حداقل یک فیلد برای ویرایش ارسال کنید.');
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
        throw new BadRequestException('نام نقش نمی‌تواند خالی باشد.');
      }

      role.name = name;
    }

    if (updateRoleDto.slug !== undefined) {
      const slug = updateRoleDto.slug.trim().toLowerCase();

      if (!slug) {
        throw new BadRequestException('شناسه نقش نمی‌تواند خالی باشد.');
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
      role.description = updateRoleDto.description?.trim() || null;
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
  async remove(actorId: string, shopId: string, id: string) {
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
