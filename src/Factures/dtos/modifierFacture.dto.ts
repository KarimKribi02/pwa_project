import { IsOptional, IsDateString } from 'class-validator';

export class ModifierFactureDto {
  @IsOptional()
  @IsDateString()
  date_emission?: string;

  @IsOptional()
  @IsDateString()
  date_paiement?: string;
}
