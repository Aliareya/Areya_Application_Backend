import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { Shop } from '../../shops/entities/shop.entity';
import { SupplierCategory } from '../enums/suppliers.enum';

@Entity('suppliers')
@Unique('uq_suppliers_shop_code', ['shopId', 'code', 'phone'])
export class Supplier {
  // Primary Key
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // Shop ID
  @Column({
    name: 'shop_id',
    type: 'bigint',
  })
  shopId!: string;

  // Shop Relation
  @ManyToOne(() => Shop, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_suppliers_shop',
  })
  shop!: Shop;

  // Supplier Name
  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  // Supplier Code
  @Column({
    type: 'varchar',
    length: 50,
  })
  code!: string;

  @Column({
    type: 'enum',
    enum: SupplierCategory,
    enumName: 'supplier_category_enum',
  })
  category!: SupplierCategory;

  // Phone Number
  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  phone!: string | null;

  // Address
  @Column({
    type: 'text',
    nullable: true,
  })
  address!: string | null;

  // Description
  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  // Supplier Status
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

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
