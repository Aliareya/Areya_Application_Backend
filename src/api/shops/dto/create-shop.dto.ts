import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty({
    message: 'نام دکان الزامی است.',
  })
  @MinLength(2, {
    message: 'نام دکان باید حداقل ۲ حرف داشته باشد.',
  })
  @MaxLength(150, {
    message: 'نام دکان نباید بیشتر از ۱۵۰ حرف باشد.',
  })
  @Matches(/\S/, {
    message: 'نام دکان نمی‌تواند فقط شامل فاصله باشد.',
  })
  name!: string;

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
