
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  @IsInt()
  @Min(1)
  workshopId!: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain lowercase letters, numbers and hyphens only',
  })
  slug!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;
}
