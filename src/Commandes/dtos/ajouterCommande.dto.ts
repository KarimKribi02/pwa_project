import { IsOptional, IsString, IsNumber } from 'class-validator';

export class AjouterCommandeDto {
  @IsOptional()
  @IsString()
  id_utilisateur?: string;

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

  // Whitelisted fallback keys
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  width?: string;

  @IsOptional()
  @IsString()
  length?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  typeBois?: string;
}
