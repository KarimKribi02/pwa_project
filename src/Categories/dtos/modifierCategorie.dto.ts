import { IsOptional, IsString } from 'class-validator';

export class ModifierCategorieDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
