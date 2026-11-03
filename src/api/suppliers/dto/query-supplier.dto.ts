// dto/query-supplier.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QuerySupplierDto {
  @IsOptional()
  @IsString({ message: 'عبارت جستجو باید متن باشد' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'شماره صفحه باید عدد باشد' })
  @Min(1, { message: 'شماره صفحه باید حداقل ۱ باشد' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'تعداد در صفحه باید عدد باشد' })
  @Min(1, { message: 'تعداد در صفحه باید حداقل ۱ باشد' })
  @Max(100, { message: 'تعداد در صفحه نباید بیشتر از ۱۰۰ باشد' })
  limit: number = 20;
}