import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Check,
} from 'typeorm';

import { Shop } from '../../shops/entities/shop.entity';
import { Store } from '../../stores/entities/store.entity';
import { UserRole } from './user-role.entity';

export enum SystemRole {
  SUPER_ADMIN = 'super_admin',
  OWNER = 'owner',
  EMPLOYEE = 'employee',
  STUDENT = 'student',
  USER = 'user',
}

@Entity('users')
@Unique('uq_users_id_shop', ['id', 'shopId'])
@Check(
  'chk_user_system_role_shop',
  `(
    ("system_role" IN('employee' ,'student') AND "shop_id" IS NOT NULL)
    OR
    ("system_role" IN ('user', 'owner', 'super_admin') AND "shop_id" IS NULL)
  )`,
)
export class User {
  // Primary Key
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // Full Name
  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 150,
  })
  fullName!: string;

  // Phone Number
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  phone!: string;

  // Email
  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    unique: true,
  })
  email!: string | null;

  // Password
  @Column({
    type: 'varchar',
    length: 255,
    select: false,
  })
  password!: string;

  // System Role
  @Column({
    name: 'system_role',
    type: 'enum',
    enum: SystemRole,
    default: SystemRole.USER,
  })
  systemRole!: SystemRole;

  // Shop ID
  @Column({
    name: 'shop_id',
    type: 'bigint',
    nullable: true,
  })
  shopId!: string | null;

  // Shop Relation
  @ManyToOne(() => Shop, (shop) => shop.users, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_users_shop',
  })
  shop!: Shop | null;

  // User Role Relation
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];

  // Owned Store Relation
  @OneToOne(() => Store, (store) => store.owner)
  ownedStore!: Store | null;

  // Account Status
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatar!: string | null;

  @Column({
    name: 'last_login_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  // Created At
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  // Updated At
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
