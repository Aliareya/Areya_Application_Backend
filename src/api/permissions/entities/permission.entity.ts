
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { RolePermission } from '../../roles/entities/role-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // Permission Name
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  // Permission Slug
  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  slug!: string;

  // Description
  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  // Role Permissions
  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions!: RolePermission[];

  // Created At
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
