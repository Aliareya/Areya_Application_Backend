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
import { WarehouseType } from '../enums/warehouse-type.enum';

@Entity('warehouses')
@Unique('UQ_warehouses_shop_name', ['shopId', 'name'])
@Unique('UQ_warehouses_shop_code', ['shopId', 'code'])
export class Warehouse {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  // دکان مالک انبار
  @Column({ name: 'shop_id', type: 'bigint' })
  shopId!: string;

  @ManyToOne(() => Shop, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_warehouses_shop',
  })
  shop!: Shop;

  // نوع انبار
  @Column({
    name: 'warehouse_type',
    type: 'enum',
    enum: WarehouseType,
  })
  warehouseType!: WarehouseType;

  // نام انبار
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  // کد انبار
  @Column({ type: 'varchar', length: 50 })
  code!: string;

  // آدرس انبار
  @Column({ type: 'text', nullable: true })
  address!: string | null;

  // توضیحات
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // وضعیت انبار
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // تاریخ ایجاد
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // تاریخ آخرین تغییر
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
