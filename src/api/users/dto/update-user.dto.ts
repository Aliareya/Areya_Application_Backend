import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}