
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { Role } from '../../../api/roles/entities/role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
@Unique('UQ_role_permissions_role_permission', ['role', 'permission'])
export class RolePermission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => Role,
    (role) => role.rolePermissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne(
    () => Permission,
    (permission) => permission.rolePermissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'permission_id' })
  permission!: Permission;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
