import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UnitCategory {
  FABRIC = 'fabric',
  TRIM = 'trim',
  MEASUREMENT = 'measurement',
}

@Entity('units')
export class Unit {
  // Primary Key
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  // Unit Name
  @Column({
    type: 'varchar',
    length: 50,
  })
  name!: string;

  // Unit Symbol
  @Column({
    type: 'varchar',
    length: 20,
  })
  symbol!: string;

  // Unit Category
  @Column({
    type: 'enum',
    enum: UnitCategory,
  })
  category!: UnitCategory;

  // Unit Status
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

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
