import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Role } from '../../../api/roles/entities/role.entity';

@Entity('user_roles')
export class UserRole {
  // User ID - Primary Key
  @PrimaryColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId!: string;

  // User Relation
  @OneToOne(() => User, (user) => user.userRole, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Role ID
  @Column({
    name: 'role_id',
    type: 'bigint',
  })
  roleId!: string;

  @ManyToOne(() => Role, (role) => role.userRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  // Shop ID
  @Column({
    name: 'shop_id',
    type: 'bigint',
  })
  shopId!: string;

  // Created At
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
