import {
  IsArray,
  IsString,
  Matches,
  ArrayUnique,
} from 'class-validator';

export class AssignRolePermissionsDto {
  @IsArray({
    message: 'فهرست دسترسی‌ها باید یک آرایه باشد.',
  })
  @ArrayUnique({
    message: 'شناسه دسترسی تکراری مجاز نیست.',
  })
  @IsString({
    each: true,
    message: 'شناسه هر دسترسی باید رشته باشد.',
  })
  @Matches(/^[1-9]\d*$/, {
    each: true,
    message: 'شناسه دسترسی نامعتبر است.',
  })
  permissionIds!: string[];
}