import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsArray,
  ArrayUnique,
  ArrayNotEmpty,
} from 'class-validator';

import { Transform } from 'class-transformer';

export class CreateRoleDto {
  // Role Name
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({
    message: 'لطفاً نام نقش را وارد کنید.',
  })
  @MinLength(2, {
    message: 'نام نقش باید حداقل ۲ حرف داشته باشد.',
  })
  @MaxLength(100, {
    message: 'نام نقش نباید بیشتر از ۱۰۰ حرف باشد.',
  })
  name!: string;

  // Role Slug
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'لطفاً شناسه نقش را وارد کنید.',
  })
  @MinLength(2, {
    message: 'شناسه نقش باید حداقل ۲ حرف داشته باشد.',
  })
  @MaxLength(100, {
    message: 'شناسه نقش نباید بیشتر از ۱۰۰ حرف باشد.',
  })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'شناسه نقش فقط باید شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد.',
  })
  slug!: string;

  // Description
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'توضیحات نقش نباید بیشتر از ۱۰۰۰ حرف باشد.',
  })
  description?: string | null;
  // Permission IDs
  @IsArray({
    message: 'دسترسی‌ها باید به شکل آرایه ارسال شوند.',
  })
  @ArrayNotEmpty({
    message: 'حداقل یک دسترسی را انتخاب کنید.',
  })
  @ArrayUnique({
    message: 'دسترسی تکراری مجاز نیست.',
  })
  @IsString({
    each: true,
    message: 'شناسه هر دسترسی باید رشته باشد.',
  })
  @Matches(/^\d+$/, {
    each: true,
    message: 'شناسه دسترسی باید عدد معتبر باشد.',
  })
  permissionIds!: string[];
}
