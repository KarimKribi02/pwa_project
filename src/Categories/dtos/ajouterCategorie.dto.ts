import { IsOptional, IsString } from 'class-validator';

export class AjouterCategoriedto {
  @IsString()
  nom: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;
}
