import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Purchase } from './purchase.entity';
import { Product } from '../../products/entities/product.entity';
import { Unit } from '../../units/entities/unit.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // فاکتور خرید
  @Column({ name: 'purchase_id', type: 'bigint' })
  purchaseId!: string;

  @ManyToOne(() => Purchase, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'purchase_id',
    foreignKeyConstraintName: 'FK_purchase_items_purchase',
  })
  purchase!: Purchase;

  // محصول خریداری شده
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_purchase_items_product',
  })
  product!: Product;

  // واحد اندازه گیری
  @Column({ name: 'unit_id', type: 'bigint' })
  unitId!: string;

  @ManyToOne(() => Unit, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'unit_id',
    foreignKeyConstraintName: 'FK_purchase_items_unit',
  })
  unit!: Unit;

  // مقدار خرید
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 3,
  })
  quantity!: string;

  // قیمت هر واحد
  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  unitPrice!: string;

  // مجموع قیمت این قلم
  @Column({
    name: 'total_price',
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  totalPrice!: string;

  // توضیحات
  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  // تاریخ ایجاد
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  // تاریخ آخرین تغییر
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}