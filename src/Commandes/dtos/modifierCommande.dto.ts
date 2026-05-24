import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ModifierCommandeDto {
  @IsOptional()
  @IsString()
  clientNom?: string;

  @IsOptional()
  @IsString()
  clientTel?: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  largeur?: string;

  @IsOptional()
  @IsString()
  longueur?: string;

  @IsOptional()
  @IsString()
  couleur?: string;

  @IsOptional()
  @IsString()
  type_bois?: string;

  @IsOptional()
  @IsNumber()
  duree?: number;

  @IsOptional()
  @IsString()
  id_produit?: string;

  @IsOptional()
  @IsNumber()
  quantite?: number;

  @IsOptional()
  @IsNumber()
  prix_total?: number;
}
