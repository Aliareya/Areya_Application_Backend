
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from '../roles/entities/role.entity';

import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // ایجاد دسترسی جدید
  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(
        'This permission slug already exists',
      );
    }

    const permission = this.permissionRepository.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
    });

    return this.permissionRepository.save(permission);
  }

  // نمایش تمام دسترسی‌ها
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { id: 'ASC' },
    });
  }

  // نمایش دسترسی‌های یک نقش
  async findByRole(roleId: number): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const relations = await this.rolePermissionRepository.find({
      where: { role: { id: roleId } },
      relations: { permission: true },
    });

    return relations.map((item) => item.permission);
  }

  // اختصاص چند دسترسی به یک نقش
  async assignToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<{ message: string }> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== new Set(permissionIds).size) {
      throw new NotFoundException(
        'One or more permissions were not found',
      );
    }

    const existing = await this.rolePermissionRepository.find({
      where: {
        role: { id: roleId },
        permission: { id: In(permissionIds) },
      },
      relations: { permission: true },
    });

    const existingIds = new Set(
      existing.map((item) => item.permission.id),
    );

    const newPermissions = permissions.filter(
      (permission) => !existingIds.has(permission.id),
    );

    const records = newPermissions.map((permission) =>
      this.rolePermissionRepository.create({
        role,
        permission,
      }),
    );

    if (records.length > 0) {
      await this.rolePermissionRepository.save(records);
    }

    return { message: 'Permissions assigned successfully' };
  }

  // حذف یک دسترسی از نقش
  async removeFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<{ message: string }> {
    const relation = await this.rolePermissionRepository.findOne({
      where: {
        role: { id: roleId },
        permission: { id: permissionId },
      },
    });

    if (!relation) {
      throw new NotFoundException(
        'Permission assignment not found',
      );
    }

    await this.rolePermissionRepository.remove(relation);

    return { message: 'Permission removed from role successfully' };
  }
}
