import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterCommandeDto } from "./dtos/ajouterCommande.dto";
import { ModifierCommandeDto } from "./dtos/modifierCommande.dto";

@Controller({})
export class CommandeController {
    constructor(private prisma: PrismaService) {}

    // Fonction utilitaire pour calculer le prix total
    private calculatePrixTotal(articles: any[]): string {
        if (!articles || articles.length === 0) return '0';
        const total = articles.reduce((sum, article) => {
            const quantite = parseFloat(article.quantite || 0);
            const prixProduit = article.produits?.prix ? parseFloat(article.produits.prix.toString()) : parseFloat(article.prix || 0);
            return sum + (quantite * prixProduit);
        }, 0);
        return total.toFixed(2);
    }

    // Fonction utilitaire pour formater la réponse commande
    private formatCommandeResponse(commande: any) {
        const articles = commande.articles_commandes || [];
        const prixTotal = this.calculatePrixTotal(articles);
        const {
            client_id,
            articles_commandes,
            facture,
            utilisateurs,
            ...commandeRest
        } = commande;

        return {
            ...commandeRest,
            id: commande.id.toString(),
            utilisateur_id: client_id?.toString(),
            prix_total: prixTotal,
            utilisateurs: utilisateurs ? {
                ...utilisateurs,
                id: utilisateurs.id.toString()
            } : null,
            articles_commandes: articles.map(article => {
                const produit = article.produits;
                return {
                    id: article.id.toString(),
                    commande_id: article.commande_id?.toString(),
                    produit_id: article.produit_id?.toString(),
                    quantite: article.quantite,
                    produits: produit ? {
                        ...produit,
                        id: produit.id.toString(),
                        categorie_id: produit.categorie_id?.toString(),
                        prix: produit.prix?.toString()
                    } : null
                };
            }),
            facture: facture?.map(f => ({
                ...f,
                id: f.id.toString(),
                commande_id: f.commande_id?.toString()
            }))
        };
    }

    // Afficher toutes les commandes
    @Get('/api/AllCommandes')
    public async getAllCommandes() {
        const commandes = await this.prisma.commandes.findMany({
            include: {
                utilisateurs: true,
                articles_commandes: {
                    include: {
                        produits: true
                    }
                },
                facture: true
            },
            orderBy: { created_at: 'desc' }
        });
        return commandes.map(cmd => this.formatCommandeResponse(cmd));
    }

    // Afficher une commande par son id
    @Get('/api/SingleCommande/:id')
    public async getCommandeById(@Param('id') id: string) {
        const commande = await this.prisma.commandes.findUnique({
            where: { id: BigInt(id) },
            include: {
                utilisateurs: true,
                articles_commandes: {
                    include: {
                        produits: true
                    }
                },
                facture: true
            }
        });
        if (!commande) throw new NotFoundException("Commande not found");
        return this.formatCommandeResponse(commande);
    }

    // Afficher les commandes d'un utilisateur
    @Get('/api/CommandesByUtilisateur/:utilisateurId')
    public async getCommandesByUtilisateur(@Param('utilisateurId') utilisateurId: string) {
        const commandes = await this.prisma.commandes.findMany({
            where: { client_id: BigInt(utilisateurId) },
            include: {
                utilisateurs: true,
                articles_commandes: {
                    include: {
                        produits: true
                    }
                },
                facture: true
            },
            orderBy: { created_at: 'desc' }
        });
        return commandes.map(cmd => this.formatCommandeResponse(cmd));
    }

    // Afficher les commandes par statut
    @Get('/api/CommandesByStatut/:statut')
    public async getCommandesByStatut(@Param('statut') statut: string) {
        const commandes = await this.prisma.commandes.findMany({
            where: { statut: statut },
            include: {
                utilisateurs: true,
                articles_commandes: {
                    include: {
                        produits: true
                    }
                },
                facture: true
            },
            orderBy: { created_at: 'desc' }
        });
        return commandes.map(cmd => this.formatCommandeResponse(cmd));
    }

    // Ajouter une commande
    @Post('/api/addCommande')
    public async addCommande(@Body() body: AjouterCommandeDto) {
        try {
            // Vérification que utilisateur_id est présent et valide
            if (!body.utilisateur_id || typeof body.utilisateur_id !== 'string' || body.utilisateur_id.trim() === '') {
                throw new NotFoundException("utilisateur_id est obligatoire et doit être une chaîne valide");
            }

            // Vérification que l'utilisateur existe
            const utilisateur = await this.prisma.utilisateurs.findUnique({
                where: { id: BigInt(body.utilisateur_id) }
            });
            if (!utilisateur) {
                throw new NotFoundException(`L'utilisateur avec l'ID ${body.utilisateur_id} n'existe pas`);
            }

            const newCommande = await this.prisma.commandes.create({
                data: {
                    client_id: BigInt(body.utilisateur_id),
                    statut: body.statut || 'en attente',
                    note: body.note || null,
                    largeur: body.largeur || null,
                    longueur: body.longueur || null,
                    couleur: body.couleur || null,
                    type_bois: body.type_bois || null,
                    prix_total: null
                },
                include: {
                    utilisateurs: true,
                    articles_commandes: {
                        include: {
                            produits: true
                        }
                    },
                    facture: true
                }
            });
            return this.formatCommandeResponse(newCommande);
        } catch (error) {
            console.error('Error creating commande:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            const message = error instanceof Error ? error.message : 'Erreur inconnue';
            throw new NotFoundException(`Erreur lors de la création de la commande: ${message}`);
        }
    }

    // Modifier une commande par id
    @Put('/api/UpdateCommande/:id')
    public async updateCommande(@Param('id') id: string, @Body() body: ModifierCommandeDto) {
        try {
            const commande = await this.prisma.commandes.update({
                where: { id: BigInt(id) },
                data: {
                    ...(body.statut && { statut: body.statut }),
                    ...(body.note !== undefined && { note: body.note }),
                    ...(body.largeur && { largeur: body.largeur }),
                    ...(body.longueur && { longueur: body.longueur }),
                    ...(body.couleur && { couleur: body.couleur }),
                    ...(body.type_bois && { type_bois: body.type_bois })
                },
                include: {
                    utilisateurs: true,
                    articles_commandes: {
                        include: {
                            produits: true
                        }
                    },
                    facture: true
                }
            });
            return this.formatCommandeResponse(commande);
        } catch (error) {
            throw new NotFoundException("Commande not found");
        }
    }

    // Supprimer une commande par id
    @Delete('/api/DeleteCommande/:id')
    public async deleteCommande(@Param('id') id: string) {
        try {
            await this.prisma.commandes.delete({
                where: { id: BigInt(id) }
            });
            return {
                message: "Commande supprimée avec succès"
            };
        } catch (error) {
            throw new NotFoundException("Commande not found");
        }
    }
}