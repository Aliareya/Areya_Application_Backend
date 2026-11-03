import { 
  IsString, 
  IsNotEmpty, 
  IsEmail, 
  MinLength, 
  Matches,
  IsNumber // 👈 اضافه کردن این دکوراتور
} from 'class-validator';

export class CreateOwnerDto {
  @IsString()
  @IsNotEmpty({ message: 'وارد کردن نام و نام خانوادگی الزامی است' })
  fullName!: string;

  @IsString()
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Matches(/^\+93\s?\d{9}$/, { message: 'فرمت شماره موبایل نامعتبر است (مثال: 783376973 93+)' })
  phoneNumber!: string;
  
  @IsString()
  @IsNotEmpty({ message: 'پسورد الزامی است' })
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password!: string;
  
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email?: string;
  
  @IsNumber({}, { message: 'شناسه کارگاه باید یک عدد معتبر باشد' }) // 👈 اصلاح شد
  @IsNotEmpty({ message: 'شناسه کارگاه الزامی است' })
  workshop_id!: number;

  @IsNumber({}, { message: 'شناسه نقش باید یک عدد معتبر باشد' }) // 👈 اصلاح شد
  @IsNotEmpty({ message: 'شناسه نقش الزامی است' })
  role_id!: number;
}