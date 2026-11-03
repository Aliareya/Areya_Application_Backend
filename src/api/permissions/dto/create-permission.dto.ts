
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @Matches(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}
