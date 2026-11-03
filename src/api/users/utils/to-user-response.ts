import { User } from "../entities/user.entity";

export function toUserResponse(user: User) {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phonNumber: user.phoneNumber,
    lastLoginAt: user.lastLoginAt,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    user_role : user.systemRole,
    workshop: user.workshop
      ? {
          id: user.workshop.id,
          name: user.workshop.name,
          address : user.workshop.address,
          status : user.workshop.status
        }
      : null,
  };
}
