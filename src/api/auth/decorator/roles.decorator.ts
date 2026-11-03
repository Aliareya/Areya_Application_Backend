import { SetMetadata } from '@nestjs/common';

// این دکوراتور نقش‌های مورد نیاز را در متادیتای مسیر ذخیره می‌کند
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);