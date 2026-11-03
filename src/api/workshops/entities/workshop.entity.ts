import { Supplier } from '../../../api/suppliers/entities/supplier.entity';
import { Role } from '../../../api/roles/entities/role.entity';
import { User } from '../../../api/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum WorkshopStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'owner_id' })
  owner!: User | null;

  @Column({
    type: 'enum',
    enum: WorkshopStatus,
    default: WorkshopStatus.INACTIVE,
  })
  status!: WorkshopStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.workshop)
  users!: User[];

  @OneToMany(() => Role, (role) => role.workshop)
  roles!: Role[];

  @OneToMany(() => Supplier, (supplier) => supplier.workshop)
  suppliers!: Supplier[];
}
