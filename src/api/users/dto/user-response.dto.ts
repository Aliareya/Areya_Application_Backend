import { SystemRole } from '../entities/user.entity';

export class UserResponseDto {
  id!: string;
  fullName!: string;
  phone!: string;
  email!: string | null;
  systemRole!: SystemRole;
  shopId!: string | null;
  isActive!: boolean;
  avatar!: string | null;
  lastLoginAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}