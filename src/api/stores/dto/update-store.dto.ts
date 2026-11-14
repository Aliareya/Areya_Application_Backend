
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class UpdateStoreDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty({
    message: 'نام فروشگاه نمی‌تواند خالی باشد.',
  })
  @MinLength(2, {
    message: 'نام فروشگاه باید حداقل ۲ حرف داشته باشد.',
  })
  @MaxLength(150, {
    message: 'نام فروشگاه نباید بیشتر از ۱۵۰ حرف باشد.',
  })
  name?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty({
    message: 'شناسه فروشگاه نمی‌تواند خالی باشد.',
  })
  @MaxLength(180, {
    message: 'شناسه فروشگاه نباید بیشتر از ۱۸۰ حرف باشد.',
  })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'شناسه فروشگاه فقط باید شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد.',
  })
  slug?: string;

  @ValidateIf(
    (_object, value) => value !== undefined && value !== null,
  )
  @IsString()
  @MaxLength(20, {
    message: 'شماره تماس نباید بیشتر از ۲۰ حرف باشد.',
  })
  phone?: string | null;

  @ValidateIf(
    (_object, value) => value !== undefined && value !== null,
  )
  @IsString()
  address?: string | null;
}
