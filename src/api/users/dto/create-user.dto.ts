import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEmail, 
  MinLength, 
  Matches 
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'وارد کردن نام و نام خانوادگی الزامی است' })
  fullName!: string;

  @IsString()
  @IsNotEmpty({ message: 'شماره موبایل الزامی است' })
  @Matches(/^\+93\s?\d{9}$/, { message: 'فرمت شماره موبایل نامعتبر است (مثال: 783376973 93+)' })
  phoneNumber!: string;

  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password!: string;

  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email?: string;
}