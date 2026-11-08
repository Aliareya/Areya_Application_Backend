import { SetMetadata } from '@nestjs/common';
import { SystemRole } from '../../api/users/entities/user.entity';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: SystemRole[]) =>
  SetMetadata(ROLES_KEY, roles);