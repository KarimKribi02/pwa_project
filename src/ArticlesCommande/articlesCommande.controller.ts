import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterArticleCommandeDto } from "./dtos/ajouterArticleCommande.dto";
import { ModifierArticleCommandeDto } from "./dtos/modifierArticleCommande.dto";

@Controller({})
export class ArticlesCommandeController {
    constructor(private prisma: PrismaService) {}

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
        const articles = await this.prisma.articles_commandes.findMany({
            include: {
                produits: true,
                commandes: true
            },
            orderBy: { id: 'asc' }
        });
        return articles.map(article => this.formatArticleResponse(article));
    }

    // Afficher un article de commande par son id
    @Get('/api/SingleArticleCommande/:id')
    public async getArticleCommandeById(@Param('id') id: string) {
        const article = await this.prisma.articles_commandes.findUnique({
            where: { id: BigInt(id) },
            include: {
                produits: true,
                commandes: true
            }
        });
        if (!article) throw new NotFoundException("Article de commande not found");
        return this.formatArticleResponse(article);
    }

    // Afficher tous les articles d'une commande
    @Get('/api/ArticlesByCommande/:commandeId')
    public async getArticlesByCommande(@Param('commandeId') commandeId: string) {
        const articles = await this.prisma.articles_commandes.findMany({
            where: { commande_id: BigInt(commandeId) },
            include: {
                produits: true,
                commandes: true
            },
            orderBy: { id: 'asc' }
        });
        return articles.map(article => this.formatArticleResponse(article));
    }

    // Afficher tous les articles d'un produit
    @Get('/api/ArticlesByProduit/:produitId')
    public async getArticlesByProduit(@Param('produitId') produitId: string) {
        const articles = await this.prisma.articles_commandes.findMany({
            where: { produit_id: BigInt(produitId) },
            include: {
                produits: true,
                commandes: true
            },
            orderBy: { id: 'asc' }
        });
        return articles.map(article => this.formatArticleResponse(article));
    }

    // Ajouter un article à une commande
    @Post('/api/addArticleCommande')
    public async addArticleCommande(@Body() body: AjouterArticleCommandeDto) {
        try {
            // Vérifications
            if (!body.commande_id || !body.produit_id || body.quantite === undefined) {
                throw new NotFoundException("commande_id, produit_id et quantite sont obligatoires");
            }

            if (body.quantite <= 0) {
                throw new NotFoundException("La quantité doit être supérieure à 0");
            }

            // Vérifier que la commande existe
            const commande = await this.prisma.commandes.findUnique({
                where: { id: BigInt(body.commande_id) }
            });
            if (!commande) {
                throw new NotFoundException(`La commande avec l'ID ${body.commande_id} n'existe pas`);
            }

            // Vérifier que le produit existe
            const produit = await this.prisma.produits.findUnique({
                where: { id: BigInt(body.produit_id) }
            });
            if (!produit) {
                throw new NotFoundException(`Le produit avec l'ID ${body.produit_id} n'existe pas`);
            }

            const newArticle = await this.prisma.articles_commandes.create({
                data: {
                    commande_id: BigInt(body.commande_id),
                    produit_id: BigInt(body.produit_id),
                    quantite: body.quantite,
                    prix: produit.prix
                },
                include: {
                    produits: true,
                    commandes: true
                }
            });
            return this.formatArticleResponse(newArticle);
        } catch (error) {
            console.error('Error creating article commande:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Erreur inconnue';
            throw new NotFoundException(`Erreur lors de la création de l'article: ${message}`);
        }
    }

    // Modifier la quantité d'un article
    @Put('/api/UpdateArticleCommande/:id')
    public async updateArticleCommande(@Param('id') id: string, @Body() body: ModifierArticleCommandeDto) {
        try {
            if (body.quantite !== undefined && body.quantite <= 0) {
                throw new NotFoundException("La quantité doit être supérieure à 0");
            }

            const article = await this.prisma.articles_commandes.update({
                where: { id: BigInt(id) },
                data: {
                    ...(body.quantite !== undefined && { quantite: body.quantite })
                },
                include: {
                    produits: true,
                    commandes: true
                }
            });
            return this.formatArticleResponse(article);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException("Article de commande not found");
        }
    }

    // Supprimer un article d'une commande
    @Delete('/api/DeleteArticleCommande/:id')
    public async deleteArticleCommande(@Param('id') id: string) {
        try {
            await this.prisma.articles_commandes.delete({
                where: { id: BigInt(id) }
            });
            return {
                message: "Article de commande supprimé avec succès"
            };
        } catch (error) {
            throw new NotFoundException("Article de commande not found");
        }
    }
}