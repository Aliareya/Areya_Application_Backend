
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  // Role Name
  @IsString()
  @IsNotEmpty({ message: 'لطفاً نام نقش را وارد کنید.' })
  @MinLength(2, {
    message: 'نام نقش باید حداقل ۲ حرف داشته باشد.',
  })
  @MaxLength(100, {
    message: 'نام نقش نباید بیشتر از ۱۰۰ حرف باشد.',
  })
  name!: string;

  // Role Slug
  @IsString()
  @IsNotEmpty({ message: 'لطفاً شناسه نقش را وارد کنید.' })
  @MinLength(2, {
    message: 'شناسه نقش باید حداقل ۲ حرف داشته باشد.',
  })
  @MaxLength(100, {
    message: 'شناسه نقش نباید بیشتر از ۱۰۰ حرف باشد.',
  })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'شناسه نقش فقط باید شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد.',
  })
  slug!: string;

  // Description
  @IsOptional()
  @IsString()
  description?: string | null;
}
