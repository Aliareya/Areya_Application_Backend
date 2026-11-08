import {
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsString({ message: 'ایمیل یا شماره تماس باید به شکل متن باشد.' })
  @MaxLength(150, {
    message: 'ایمیل یا شماره تماس نباید بیشتر از ۱۵۰ حرف باشد.',
  })
  identifier!: string;

  @IsString({ message: 'رمز عبور باید به شکل متن باشد.' })
  @MinLength(8, {
    message: 'رمز عبور باید حداقل ۸ حرف داشته باشد.',
  })
  password!: string;
}