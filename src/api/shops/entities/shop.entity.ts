import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { Store } from '../../stores/entities/store.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';

export enum ShopStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('shops')
@Unique('uq_shops_store_normalized_name', ['storeId', 'normalizedName'])
@Unique('uq_shops_store_slug', ['storeId', 'slug'])
@Unique('uq_shops_id_store', ['id', 'storeId'])
export class Shop {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({
    name: 'store_id',
    type: 'bigint',
  })
  storeId!: string;

  // Store Relation
  @ManyToOne(() => Store, (store) => store.shops, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'store_id',
    foreignKeyConstraintName: 'FK_shops_store',
  })
  store!: Store;

  // Shop Name
  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  // Normalized Shop Name (used for uniqueness)
  @Column({
    name: 'normalized_name',
    type: 'varchar',
    length: 150,
  })
  normalizedName!: string;

  // Shop Slug
  @Column({
    type: 'varchar',
    length: 180,
  })
  slug!: string;

  // Phone Number
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone!: string | null;

  // Address
  @Column({
    type: 'text',
    nullable: true,
  })
  address!: string | null;

  // Logo
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  logo!: string | null;

  @Column({
    name: 'logo_public_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  logoPublicId!: string | null;

  // Shop Status
  @Column({
    type: 'enum',
    enum: ShopStatus,
    default: ShopStatus.INACTIVE,
  })
  status!: ShopStatus;

  // Shop Employees
  @OneToMany(() => User, (user) => user.shop)
  users!: User[];

  // Shop Roles
  @OneToMany(() => Role, (role) => role.shop)
  roles!: Role[];

  // Timestamps
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
