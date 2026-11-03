// dto/create-supplier.dto.ts
import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  MaxLength, 
  IsEnum, 
  isNotEmpty
} from 'class-validator';
import { SupplierCategory, SupplierStatus } from '../entities/supplier.entity'; // مسیر ایمپورت را بررسی کنید

export class CreateSupplierDto {
  @IsString({ message: 'نام تأمین‌کننده باید متن باشد' })
  @IsNotEmpty({ message: 'نام تأمین‌کننده الزامی است' })
  @MaxLength(150, { message: 'نام تأمین‌کننده نباید بیشتر از ۱۵۰ حرف باشد' })
  name!: string;
  
  @IsOptional()
  @IsString({ message: 'نام دکان باید متن باشد' })
  @MaxLength(150, { message: 'نام دکان نباید بیشتر از ۱۵۰ حرف باشد' })
  supplierShopName?: string;

  @IsEnum(SupplierCategory, { 
    message: 'نوعیت تامین کننده الزامی است' 
  })
  kind?: SupplierCategory;

  @IsOptional()
  @IsString({ message: 'شماره تماس باید متن باشد' })
  @MaxLength(30, { message: 'شماره تماس نباید بیشتر از ۳۰ حرف باشد' })
  phone?: string;

  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;
  
  @IsOptional()
  @IsString({ message: 'آدرس باید متن باشد' })
  address?: string;

  @IsNotEmpty({message : 'ایدی کازگاه الزامی است'})
  workshopID!:number
}