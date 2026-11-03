import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
      @IsString()
      @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
      @IsNotEmpty({message:'رمز عبور ضروری است'})
      password!: string;
    
      @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
      @IsNotEmpty({message:'ایمیل ضروری است'})
      email!: string;
}