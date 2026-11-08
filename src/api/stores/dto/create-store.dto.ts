
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'لطفاً نام فروشگاه را وارد کنید.' })
  @MinLength(2, {
    message: 'نام فروشگاه باید حداقل ۲ حرف داشته باشد.',
  })
  @MaxLength(150, {
    message: 'نام فروشگاه نباید بیشتر از ۱۵۰ حرف باشد.',
  })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'لطفاً شناسه انگلیسی فروشگاه را وارد کنید.' })
  @MaxLength(180, {
    message: 'شناسه فروشگاه نباید بیشتر از ۱۸۰ حرف باشد.',
  })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'شناسه فروشگاه فقط باید شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد.',
  })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, {
    message: 'شماره تماس نباید بیشتر از ۲۰ حرف باشد.',
  })
  phone?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;
}
