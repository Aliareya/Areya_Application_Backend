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
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  // Store Logo
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  logo!: string | null;

  @Column({
    type: 'enum',
    enum: StoreStatus,
    default: StoreStatus.INACTIVE,
  })
  status!: StoreStatus;

  @OneToMany(() => Shop, (shop) => shop.store)
  shops!: Shop[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
