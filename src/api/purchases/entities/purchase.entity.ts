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
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export enum PurchaseStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('purchases')
@Unique('uq_purchases_shop_purchase_number', ['shopId', 'purchaseNumber'])
export class Purchase {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // دکان مربوط به خرید
  @Column({ name: 'shop_id', type: 'bigint' })
  shopId!: string;

  @ManyToOne(() => Shop, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_purchases_shop',
  })
  shop!: Shop;

  // گدام مقصد
  @Column({ name: 'warehouse_id', type: 'bigint' })
  warehouseId!: string;

  @ManyToOne(() => Warehouse, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'warehouse_id',
    foreignKeyConstraintName: 'FK_purchases_warehouse',
  })
  warehouse!: Warehouse;

  // فروشنده
  @Column({ name: 'supplier_id', type: 'bigint' })
  supplierId!: string;

  @ManyToOne(() => Supplier, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'supplier_id',
    foreignKeyConstraintName: 'FK_purchases_supplier',
  })
  supplier!: Supplier;

  // شماره داخلی فاکتور خرید
  @Column({ name: 'purchase_number', type: 'varchar', length: 50 })
  purchaseNumber!: string;

  // شماره فاکتور فروشنده (اختیاری)
  @Column({
    name: 'supplier_invoice_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  supplierInvoiceNumber!: string | null;

  // تاریخ واقعی خرید
  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate!: string;

  // وضعیت خرید
  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.DRAFT,
  })
  status!: PurchaseStatus;

  // مجموع مبلغ خرید
  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
  })
  totalAmount!: string;

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
