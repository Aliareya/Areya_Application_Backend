
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';

import { User } from './user.entity';
import { Role } from '../../../api/roles/entities/role.entity';

@Entity('user_roles')
@Index('IDX_user_roles_role_shop', ['roleId', 'shopId'])
export class UserRole {
  @PrimaryColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId!: string;

  @Column({
    name: 'role_id',
    type: 'bigint',
  })
  roleId!: string;

  @Column({
    name: 'shop_id',
    type: 'bigint',
  })
  shopId!: string;

  // User Relation
  @ManyToOne(() => User, (user) => user.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_user_roles_user_shop',
    },
    {
      name: 'shop_id',
      referencedColumnName: 'shopId',
    },
  ])
  user!: User;

  // Role Relation
  @ManyToOne(() => Role, (role) => role.userRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'role_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_user_roles_role_shop',
    },
    {
      name: 'shop_id',
      referencedColumnName: 'shopId',
    },
  ])
  role!: Role;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
