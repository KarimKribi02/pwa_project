import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterArticleCommandeDto } from "./dtos/ajouterArticleCommande.dto";
import { ModifierArticleCommandeDto } from "./dtos/modifierArticleCommande.dto";

@Controller({})
export class ArticlesCommandeController {
    constructor(private prisma: PrismaService) {}

    // La table/model articles_commandes a été supprimée du schéma Prisma.
    // Ce controller reste uniquement pour éviter des erreurs de compilation.


    // Fonction utilitaire pour formater la réponse
    private formatArticleResponse(article: any) {
        const produit = article.produits;
        return {
            id: article.id.toString(),
            commande_id: article.commande_id?.toString(),
            produit_id: article.produit_id?.toString(),
            quantite: article.quantite,
            produits: produit ? {
                id: produit.id.toString(),
                nom: produit.nom,
                slug: produit.slug,
                description: produit.description,
                prix: produit.prix?.toString(),
                categorie_id: produit.categorie_id?.toString(),
                vedette: produit.vedette,
                created_at: produit.created_at
            } : null
        };
    }

    // Afficher tous les articles de commande
    @Get('/api/AllArticlesCommande')
    public async getAllArticlesCommande() {
        // Suppression du model articles_commandes : endpoint non supporté.
        return [];
    }


    // Afficher un article de commande par son id
    @Get('/api/SingleArticleCommande/:id')
    public async getArticleCommandeById(@Param('id') id: string) {
        // Suppression du model articles_commandes : endpoint non supporté.
        throw new NotFoundException("Article de commande not found");
    }


    // Afficher tous les articles d'une commande
    @Get('/api/ArticlesByCommande/:commandeId')
    public async getArticlesByCommande(@Param('commandeId') commandeId: string) {
        // Suppression du model articles_commandes : endpoint non supporté.
        return [];
    }


    // Les endpoints articles_commandes ont été supprimés car le model a disparu du schéma Prisma.
    // (gestion désormais via commandes.produit_id + commandes.quantite)

}