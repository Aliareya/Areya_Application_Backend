
import {
  IsString,
  Matches,
} from 'class-validator';

export class AssignUserRoleDto {
  @IsString({
    message: 'شناسه نقش باید رشته باشد.',
  })
  @Matches(/^[1-9]\d*$/, {
    message: 'شناسه نقش نامعتبر است.',
  })
  roleId!: string;
}
