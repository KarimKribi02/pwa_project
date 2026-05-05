export class AjouterCommandeDto {
  id_utilisateur!: string;
  statut?: string;
  note?: string;
  largeur?: string;
  longueur?: string;
  couleur?: string;
  type_bois?: string;
  duree?: number;
  id_produit?: string;
  quantite?: number;
}
