import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CATEGORY_COLORS, type CategoryColor } from '../category-colors.js';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsIn(CATEGORY_COLORS)
  color: CategoryColor;
}
