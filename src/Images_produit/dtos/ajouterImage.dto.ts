import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class AjouterImageDto {
  @IsString()
  produit_id: string;

  @IsOptional()
  @IsBoolean()
  principale?: boolean;
}
