import { Request } from 'express';
import { SystemRole } from '../../api/users/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    systemRole: SystemRole;
  };
}