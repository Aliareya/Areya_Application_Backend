
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';

import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Shop } from '../shops/entities/shop.entity';

import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      RolePermission,
      User,
      UserRole,
      Shop,
    ]),
    PermissionsModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
