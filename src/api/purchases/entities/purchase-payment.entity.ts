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

export enum PurchasePaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  OTHER = 'other',
}

@Entity('purchase_payments')
export class PurchasePayment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // خرید مربوط به پرداخت
  @Column({ name: 'purchase_id', type: 'bigint' })
  purchaseId!: string;

  @ManyToOne(() => Purchase, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'purchase_id',
    foreignKeyConstraintName: 'FK_purchase_payments_purchase',
  })
  purchase!: Purchase;

  // مبلغ پرداخت شده
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  amount!: string;

  // روش پرداخت
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PurchasePaymentMethod,
    default: PurchasePaymentMethod.CASH,
  })
  paymentMethod!: PurchasePaymentMethod;

  // تاریخ و وقت پرداخت
  @Column({
    name: 'payment_date',
    type: 'timestamptz',
  })
  paymentDate!: Date;

  // شماره رسید یا حواله
  @Column({
    name: 'reference_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referenceNumber!: string | null;

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
