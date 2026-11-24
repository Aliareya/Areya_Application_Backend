
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
import { Product } from './product.entity';
import { ProductType } from '../enums/product-type.enum';

@Entity('categories')
@Unique('UQ_categories_shop_code', ['shopId', 'code'])
@Unique('UQ_categories_shop_name', ['shopId', 'name'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // دکان مالک دسته‌بندی
  @Column({ name: 'shop_id', type: 'bigint' })
  shopId!: string;

  @ManyToOne(() => Shop, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_categories_shop',
  })
  shop!: Shop;

  // نوع محصولات این دسته‌بندی
  @Column({
    name: 'product_type',
    type: 'enum',
    enum: ProductType,
  })
  productType!: ProductType;

  // نام دسته‌بندی
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  // کد دسته‌بندی
  @Column({ type: 'varchar', length: 50 })
  code!: string;

  // توضیحات
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // محصولات مربوط به این دسته‌بندی
  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  // وضعیت دسته‌بندی
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
