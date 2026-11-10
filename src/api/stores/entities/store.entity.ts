import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../../api/users/entities/user.entity';
import { Shop } from '../../../api/shops/entities/shop.entity';

export enum StoreStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export enum StoreCreationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'owner_id', type: 'bigint', unique: true })
  ownerId!: string;

  @OneToOne(() => User, (user) => user.ownedStore, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'owner_id',
    foreignKeyConstraintName: 'FK_stores_owner',
  })
  owner!: User;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({
    type: 'varchar',
    length: 180,
    unique: true,
  })
  slug!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

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

  @Column({
    type: 'enum',
    enum: StoreStatus,
    default: StoreStatus.PENDING,
  })
  status!: StoreStatus;

  @Column({
    name: 'creation_status',
    type: 'enum',
    enum: StoreCreationStatus,
    default: StoreCreationStatus.PENDING,
  })
  creationStatus!: StoreCreationStatus;

  @OneToMany(() => Shop, (shop) => shop.store)
  shops!: Shop[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
