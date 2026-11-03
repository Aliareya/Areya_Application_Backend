import { IsNotEmpty, IsString, MinLength, MaxLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateWorkshopDto {
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: "نام کارگاه اجباری است، لطفاً یک نام وارد کنید" })
    @IsString({ message: "نام کارگاه باید یک متن معتبر باشد" })
    @MinLength(5, { message: "نام کارگاه باید حداقل ۵ حرف باشد" })
    @MaxLength(100, { message: "نام کارگاه نباید بیشتر از ۱۰۰ حرف باشد" }) // هماهنگ با Entity شما
    name!: string;

    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: "آدرس اجباری است، لطفاً آدرس کامل و صحیح را وارد کنید" })
    @IsString({ message: "آدرس باید یک متن معتبر باشد" })
    @MinLength(10, { message: "آدرس وارد شده خیلی کوتاه و نامعتبر است" })
    @MaxLength(255, { message: "آدرس نباید بیشتر از ۲۵۵ حرف باشد" })
    address!: string;
}