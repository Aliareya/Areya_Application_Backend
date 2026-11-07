
import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Role } from './role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('role_permissions')
export class RolePermission {
  // Role ID - Composite Primary Key
  @PrimaryColumn({
    name: 'role_id',
    type: 'bigint',
  })
  roleId!: string;

  // Role Relation
  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  // Permission ID - Composite Primary Key
  @PrimaryColumn({
    name: 'permission_id',
    type: 'bigint',
  })
  permissionId!: string;

  // Permission Relation
  @ManyToOne(
    () => Permission,
    (permission) => permission.rolePermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'permission_id' })
  permission!: Permission;

  // Created At
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
