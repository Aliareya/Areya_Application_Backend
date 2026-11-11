import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

import { SystemRole } from '../entities/user.entity';

export class CreateShopUserDto {
  @IsString({ message: 'نام کامل باید به شکل متن باشد.' })
  @IsNotEmpty({ message: 'وارد کردن نام کامل الزامی است.' })
  @Length(2, 100, {
    message: 'نام کامل باید حداقل ۲ و حداکثر ۱۰۰ حرف داشته باشد.',
  })
  fullName!: string;

  @IsString({ message: 'شماره تماس باید به شکل متن باشد.' })
  @IsNotEmpty({ message: 'وارد کردن شماره تماس الزامی است.' })
  @Length(7, 20, {
    message: 'شماره تماس باید حداقل ۷ و حداکثر ۲۰ کاراکتر داشته باشد.',
  })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'آدرس ایمیل معتبر نیست.' })
  @MaxLength(150, {
    message: 'ایمیل نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.',
  })
  email?: string;

  @IsString({ message: 'رمز عبور باید به شکل متن باشد.' })
  @IsNotEmpty({ message: 'وارد کردن رمز عبور الزامی است.' })
  @MinLength(8, {
    message: 'رمز عبور باید حداقل ۸ کاراکتر داشته باشد.',
  })
  @MaxLength(100, {
    message: 'رمز عبور نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.',
  })
  password!: string;


  @IsNotEmpty({ message: 'انتخاب نوع کاربر الزامی است.' })
  @IsIn([SystemRole.EMPLOYEE, SystemRole.STUDENT], {
    message: 'نوع کاربر باید مدیر (employee) یا شاگرد (student) باشد.',
  })
  systemRole!: SystemRole.EMPLOYEE | SystemRole.STUDENT;

  @IsString({ message: 'شناسه نقش باید به شکل متن باشد.' })
  @IsNotEmpty({ message: 'انتخاب نقش (Role) الزامی است.' })
  roleId!: string;
}
