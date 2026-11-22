
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';

import { Shop } from '../../shops/entities/shop.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('inventories')

@Index(
  'UQ_inventory_fabric_stock',
  ['shopId', 'warehouseId', 'productId'],
  {
    unique: true,
    where: '"variant_id" IS NULL',
  },
)

@Index(
  'UQ_inventory_variant_stock',
  ['shopId', 'warehouseId', 'productId', 'variantId'],
  {
    unique: true,
    where: '"variant_id" IS NOT NULL',
  },
)

@Check('CHK_inventory_quantity_non_negative', '"quantity" >= 0')

export class Inventory {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  // Shop
  @Column({ type: 'bigint', name: 'shop_id' })
  shopId!: string;

  @ManyToOne(() => Shop, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_inventory_shop',
  })
  shop!: Shop;

  // Warehouse
  @Column({ type: 'bigint', name: 'warehouse_id' })
  warehouseId!: string;

  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'warehouse_id',
    foreignKeyConstraintName: 'FK_inventory_warehouse',
  })
  warehouse!: Warehouse;

  // Product
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_inventory_product',
  })
  product!: Product;

  // Product Variant (Color + Size)
  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  variantId!: string | null;

  @ManyToOne(() => ProductVariant, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'FK_inventory_product_variant',
  })
  variant!: ProductVariant | null;

  // Current Stock Quantity
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 3,
    default: 0,
  })
  quantity!: string;

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
