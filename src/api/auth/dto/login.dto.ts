import {
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @MaxLength(150)
  identifier!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}