import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterCommandeDto } from "./dtos/ajouterCommande.dto";
import { ModifierCommandeDto } from "./dtos/modifierCommande.dto";

@Controller({})
export class CommandeController {
    constructor(private prisma: PrismaService) {}

    // Fonction utilitaire pour calculer le prix total
private calculatePrixTotal(commande: any): string {
        const produit = commande.produits;
        if (!produit?.prix) return '0';
        const quantity = commande.quantite || 1;
        return parseFloat(produit.prix.toString()) * quantity + '';
    }

    // Fonction utilitaire pour formater la réponse commande
private formatCommandeResponse(commande: any) {
        const utilisateurs = commande.utilisateurs;
        const factures = commande.facture || [];
        const prixTotal = this.calculatePrixTotal(commande);

        return {
            ...commande,
            id: commande.id.toString(),
            utilisateur_id: commande.utilisateur_id?.toString() || null,
            id_produit: commande.id_produit?.toString() || null,
            duree: commande.duree,
            quantite: commande.quantite,
            prix_total: prixTotal,
            utilisateurs: utilisateurs ? {
                ...utilisateurs,
                id: utilisateurs.id.toString()
            } : null,
            produits: commande.produits ? {
                ...commande.produits,
                id: commande.produits.id.toString(),
                categorie_id: commande.produits.categorie_id?.toString(),
                prix: commande.produits.prix?.toString()
            } : null,
            factures: factures.map(f => ({
                ...f,
                id: f.id_facture.toString(),
                id_commande: f.id_commande?.toString()
            }))
        };

    }

    // Afficher toutes les commandes
    @Get('/api/AllCommandes')
    public async getAllCommandes() {
        const commandes = await this.prisma.commandes.findMany({
include: {
                utilisateurs: true,
                produits: true,
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
                produits: true,
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
            where: { utilisateur_id: BigInt(utilisateurId) },
            include: {
                utilisateurs: true,
                produits: true,
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
                produits: true,
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
if (!body.id_utilisateur || typeof body.id_utilisateur !== 'string' || body.id_utilisateur.trim() === '') {
                throw new NotFoundException("utilisateur_id est obligatoire et doit être une chaîne valide");
            }

            // Vérification que l'utilisateur existe
const utilisateur = await this.prisma.utilisateurs.findUnique({
                where: { id: BigInt(body.id_utilisateur) }
            });
            if (!utilisateur) {
throw new NotFoundException(`L'utilisateur avec l'ID ${body.id_utilisateur} n'existe pas`);
            }

            const newCommande = await this.prisma.commandes.create({
                data: {
                    utilisateur_id: BigInt(body.id_utilisateur),
                    statut: body.statut || 'en attente',
                    largeur: body.largeur || null,
                    longueur: body.longueur || null,
                    couleur: body.couleur || null,
                    type_bois: body.type_bois || null,
                    ...(body.duree && { duree: body.duree }),
                    ...(body.id_produit && { id_produit: BigInt(body.id_produit) }),
                    ...(body.quantite && { quantite: body.quantite })
                },
                include: {
                    utilisateurs: true,
                    produits: true,
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
                    ...(body.note && { note: body.note }),
                    ...(body.largeur && { largeur: body.largeur }),
                    ...(body.longueur && { longueur: body.longueur }),
                    ...(body.couleur && { couleur: body.couleur }),
                    ...(body.type_bois && { type_bois: body.type_bois }),
                    ...(body.duree && { duree: body.duree }),
                    ...(body.id_produit && { id_produit: BigInt(body.id_produit) }),
                    ...(body.quantite && { quantite: body.quantite })
                },
                include: {
                    utilisateurs: true,
                    produits: true,
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