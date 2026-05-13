import { IsInt, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class AjouterFactureDto {
  @Type(() => Number)
  @IsInt()
  id_commande: number;

  @Type(() => Number)
  @IsInt()
  id_utilisateur: number;

  @IsOptional()
  @IsDateString()
  date_emission?: string;

  @IsOptional()
  @IsDateString()
  date_paiement?: string;
}
