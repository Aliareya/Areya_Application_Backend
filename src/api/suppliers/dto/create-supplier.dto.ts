import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { SupplierCategory } from '../enums/suppliers.enum';


export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty({ message: 'نام تأمین‌کننده الزامی است.' })
  @MaxLength(150)
  name!: string;

  @IsEnum(SupplierCategory, {
    message: 'دسته‌بندی تأمین‌کننده معتبر نیست.',
  })
  category!: SupplierCategory;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}