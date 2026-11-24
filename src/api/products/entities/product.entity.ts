
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

import { Shop } from '../../shops/entities/shop.entity';
import { Category } from './category.entity';
import { Color } from '../../colors/entities/color.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductType } from '../enums/product-type.enum';


@Entity('products')
@Unique('uq_products_shop_code', ['shopId', 'code'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // دکان مالک محصول
  @Column({ name: 'shop_id', type: 'bigint' })
  shopId!: string;

  @ManyToOne(() => Shop, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_products_shop',
  })
  shop!: Shop;

  // دسته‌بندی محصول
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => Category, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'FK_products_category',
  })
  category!: Category;

  // نوع محصول
  @Column({
    name: 'product_type',
    type: 'enum',
    enum: ProductType,
  })
  productType!: ProductType;

  // نام محصول
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  // کد محصول
  @Column({ type: 'varchar', length: 50 })
  code!: string;

  // توضیحات
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // نوع پارچه، مانند مخمل، کرپ یا لینن
  @Column({
    name: 'fabric_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  fabricType!: string | null;

  // رنگ پارچه
  @Column({ name: 'color_id', type: 'bigint', nullable: true })
  colorId!: string | null;

  @ManyToOne(() => Color, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'color_id',
    foreignKeyConstraintName: 'FK_products_color',
  })
  color!: Color | null;

  // عرض پارچه به سانتی‌متر
  @Column({
    name: 'width_cm',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  widthCm!: string | null;

  // انواع رنگ و سایز لباس‌های آماده
  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants!: ProductVariant[];

  // وضعیت محصول
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

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
