
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';

import { Workshop } from '../../../api/workshops/entities/workshop.entity';
import { User } from '../../../api/users/entities/user.entity';
import { RolePermission } from '../../../api/permissions/entities/role-permission.entity';

@Entity('roles')
@Unique('UQ_roles_workshop_slug', ['workshop', 'slug'])
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => Workshop, (workshop) => workshop.roles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workshop_id' })
  workshop!: Workshop;

  @OneToMany(() => User, (user) => user.roleEntity)
  users!: User[];

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions!: RolePermission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
