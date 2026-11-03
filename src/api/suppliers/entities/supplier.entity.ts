import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workshop } from '../../../api/workshops/entities/workshop.entity';

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum SupplierCategory {
  FABRIC_SELLER = 'fabric_seller',   
  MACHINE_SELLER = 'machine_seller', 
  MATERIAL_SELLER = 'material_seller', 
}

@Entity('suppliers')
@Index(['workshopId', 'phone'], { unique: true })
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ name: 'supplier_shop_name', length: 150, nullable: true })
  supplierShopName!: string;

  @Column({
    type: 'enum',
    enum: SupplierCategory,
    nullable:false
  })
  kind!: SupplierCategory;

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
  })
  status!: SupplierStatus;

  @Index()
  @Column({ name: 'workshop_id' })
  workshopId!: number;

  @ManyToOne(() => Workshop, (workshop) => workshop.suppliers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workshop_id' })
  workshop!: Workshop;

  @Column({ length: 30, nullable: false })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}