import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';
import { SYSTEM_PERMISSIONS } from './constants/permissions.constant';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // Register system permissions when the module starts
  async onModuleInit(): Promise<void> {
    await this.seedPermissions();
  }

  // Seed permissions without creating duplicates
  async seedPermissions(): Promise<void> {
    for (const permission of SYSTEM_PERMISSIONS) {
      await this.permissionRepository.upsert(
        {
          name: permission.name,
          slug: permission.slug,
          description: permission.description,
        },
        ['slug'],
      );
    }
  }

  // Get all permissions
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      select:{
        id:true,
        name:true,
        slug:true
      },
      order: {
        id: 'ASC',
      },
    });
  }

  // Get permission by ID
  async findOne(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { id },
    });
  }
}
