
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { PermissionGuard } from '../../common/guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      RolePermission,
      Role,
      User,
      Workshop,
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService , PermissionGuard],
  exports: [PermissionsService , PermissionGuard],
})
export class PermissionsModule {}
