
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Check,
} from 'typeorm';

import { Shop } from '../../shops/entities/shop.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Unit } from '../../units/entities/unit.entity';

import { InventoryReferenceType, InventoryTransactionType } from '../enums/inventory.enum';

@Entity('inventory_transactions')

@Index('IDX_inventory_transactions_shop', ['shopId'])
@Index('IDX_inventory_transactions_warehouse', ['warehouseId'])
@Index('IDX_inventory_transactions_product', ['productId'])
@Index('IDX_inventory_transactions_reference', ['referenceType', 'referenceId'])
@Index('IDX_inventory_transactions_created_at', ['createdAt'])

@Check('CHK_inventory_transaction_quantity_positive', '"quantity" > 0')

export class InventoryTransaction {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  // Shop
  @Column({ type: 'bigint', name: 'shop_id' })
  shopId!: string;

  @ManyToOne(() => Shop, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_inventory_transactions_shop',
  })
  shop!: Shop;

  // Warehouse
  @Column({ type: 'bigint', name: 'warehouse_id' })
  warehouseId!: string;

  @ManyToOne(() => Warehouse, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'warehouse_id',
    foreignKeyConstraintName: 'FK_inventory_transactions_warehouse',
  })
  warehouse!: Warehouse;

  // Product
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_inventory_transactions_product',
  })
  product!: Product;

  // Product Variant
  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  variantId!: string | null;

  @ManyToOne(() => ProductVariant, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'FK_inventory_transactions_variant',
  })
  variant!: ProductVariant | null;

  // Unit
  @Column({ type: 'bigint', name: 'unit_id' })
  unitId!: string;

  @ManyToOne(() => Unit, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'unit_id',
    foreignKeyConstraintName: 'FK_inventory_transactions_unit',
  })
  unit!: Unit;

  // Transaction Type
  @Column({
    type: 'enum',
    enum: InventoryTransactionType,
    enumName: 'inventory_transaction_type_enum',
    name: 'transaction_type',
  })
  transactionType!: InventoryTransactionType;

  // Quantity
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 3,
  })
  quantity!: string;

  // Reference
  @Column({
    type: 'enum',
    enum: InventoryReferenceType,
    enumName: 'inventory_reference_type_enum',
    name: 'reference_type',
    nullable: true,
  })
  referenceType!: InventoryReferenceType | null;

  @Column({
    type: 'bigint',
    name: 'reference_id',
    nullable: true,
  })
  referenceId!: string | null;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  // User who created the transaction
  @Column({ type: 'bigint', name: 'created_by', nullable: true })
  createdBy!: string | null;

  // Timestamp
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
