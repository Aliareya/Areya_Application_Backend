
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

import { Product } from './product.entity';
import { Color } from '../../colors/entities/color.entity';
import { Size } from '../../sizes/entities/size.entity';

@Entity('product_variants')
@Unique('UQ_product_variant_combination', [
  'productId',
  'colorId',
  'sizeId',
])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Product
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_product_variants_product',
  })
  product!: Product;

  // Color
  @Column({ type: 'bigint', name: 'color_id' })
  colorId!: string;

  @ManyToOne(() => Color, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'color_id',
    foreignKeyConstraintName: 'FK_product_variants_color',
  })
  color!: Color;

  // Size
  @Column({ type: 'bigint', name: 'size_id' })
  sizeId!: string;

  @ManyToOne(() => Size, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'size_id',
    foreignKeyConstraintName: 'FK_product_variants_size',
  })
  size!: Size;

  // Variant Code
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  // Status
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
