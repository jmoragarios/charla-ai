import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class FindTasksQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  done?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
