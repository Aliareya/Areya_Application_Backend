import { Workshop } from '../../../api/workshops/entities/workshop.entity';
import { SubscriptionPlan } from '../../../api/subscription-plan/entities/subscription-plan.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Role } from '../../../api/roles/entities/role.entity';

export enum SystemRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'full_name', length: 100 })
  fullName!: string;

  @ManyToOne(() => Workshop, (workshop) => workshop.users, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workshop_id' })
  workshop!: Workshop;

  @Column({ name: 'phone_number', length: 15, unique: true })
  phoneNumber!: string;

  @Column({ length: 255, unique: true, nullable: false })
  email!: string;

  @Column({ name: 'email_verified', type: 'boolean', nullable: true })
  emailVerified!: boolean;

  @Column({ name: 'password', length: 255, nullable: true, select: false })
  password!: string;

  @Column({ name: 'google_id', length: 255, unique: true, nullable: true })
  googleId!: string;

  @Column({ name: 'image', type: 'text', nullable: true })
  avatarUrl!: string;

  @Column({
    name: 'system_role',
    type: 'enum',
    enum: SystemRole,
    default: SystemRole.USER, 
  })
  systemRole!: SystemRole;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan!: SubscriptionPlan;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'role_id' })
  roleEntity!: Role | null;
}
