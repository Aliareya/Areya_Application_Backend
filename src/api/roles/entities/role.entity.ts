import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { Shop } from '../../shops/entities/shop.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from '../../../api/users/entities/user-role.entity';

@Entity('roles')
@Unique('uq_roles_shop_slug', ['shopId', 'slug'])
@Unique('uq_roles_id_shop', ['id', 'shopId'])
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // Shop ID
  @Column({
    name: 'shop_id',
    type: 'bigint',
  })
  shopId!: string;

  // Shop Relation
  @ManyToOne(() => Shop, (shop) => shop.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shop_id' })
  shop!: Shop;

  // Role Name
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  // Role Slug
  @Column({
    type: 'varchar',
    length: 100,
  })
  slug!: string;

  // Description
  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  // Users Assigned to This Role
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles!: UserRole[];

  // Role Permissions
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions!: RolePermission[];

  // Created At
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
