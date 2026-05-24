
import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterCommandeDto } from "./dtos/ajouterCommande.dto";
import { ModifierCommandeDto } from "./dtos/modifierCommande.dto";
import { EmailService } from "src/email/email.service";
import { Logger } from "@nestjs/common";

@Controller({})
export class CommandeController {
    private readonly logger = new Logger(CommandeController.name);

    constructor(
        private prisma: PrismaService,
        private readonly emailService: EmailService,
    ) {}

    // Fonction utilitaire pour calculer le prix total
    private calculatePrixTotal(commande: any): string {
        const produitPrix = commande.produits?.prix ? parseFloat(commande.produits.prix.toString()) : 0;
        const quantite = commande.quantite ?? 1;
        const total = produitPrix * quantite;
        return total.toString();
    }

    // Fonction utilitaire pour formater la réponse commande
    private formatCommandeResponse(commande: any) {
        const utilisateurs = commande.utilisateurs;
        const factures = commande.facture || [];
        const prixTotal = this.calculatePrixTotal(commande);


        return {
            id: commande.id.toString(),
            client_id: commande.client_id?.toString() || null,
            produit_id: commande.produit_id?.toString?.() ?? null,
            statut: commande.statut || null,
            note: commande.note || null,
            created_at: commande.created_at ? commande.created_at.toISOString() : null,
            largeur: commande.largeur || null,
            longueur: commande.longueur || null,
            couleur: commande.couleur || null,
            type_bois: commande.type_bois || null,
            duree: commande.duree || null,
            quantite: commande.quantite ?? 1,
            prix_total: prixTotal,
            utilisateurs: utilisateurs ? {
                id: utilisateurs.id.toString(),
                nom: utilisateurs.nom || null,
                email: utilisateurs.email || null,
                telephone: utilisateurs.telephone || null,
                role: utilisateurs.role || null,
                adresse: utilisateurs.adresse || null,
                created_at: utilisateurs.created_at ? utilisateurs.created_at.toISOString() : null
            } : null,
            produits: commande.produits ? {
                id: commande.produits.id.toString(),
                nom: commande.produits.nom || null,
                slug: commande.produits.slug || null,
                description: commande.produits.description || null,
                categorie_id: commande.produits.categorie_id?.toString() || null,
                prix: commande.produits.prix?.toString() || null,
                vedette: commande.produits.vedette ?? false,
                created_at: commande.produits.created_at ? commande.produits.created_at.toISOString() : null
            } : null,
            factures: factures.map((f: any) => ({

                id: f.id.toString(),
                commande_id: f.commande_id?.toString() || null,
                utilisateur_id: f.utilisateur_id?.toString() || null,
                numero_facture: f.numero_facture || null,
                date_emission: f.date_emission ? f.date_emission.toISOString() : null,
                date_paiement: f.date_paiement ? f.date_paiement.toISOString() : null,
                montant_totale: f.montant_totale?.toString() || null,
                statut: f.statut || null,
                created_at: f.created_at ? f.created_at.toISOString() : null,
                nomcomplete: f.nomcomplete || null,
                adresse: f.adresse || null,
                telephone: f.telephone || null,
                email: f.email || null
            }))
        };

    }

    // Afficher toutes les commandes
    @Get('/api/AllCommandes')
    public async getAllCommandes() {
        const commandes = await this.prisma.commandes.findMany({
            include: {
                utilisateurs: true,
                // Certains enregistrements n'ont pas de relation produits (commande.produit_id n'existe pas en DB).
                // On garde l'inclusion pour compatibilité mais le formatCommandeResponse doit fallback.
                produits: true,
                facture: true
            },
            orderBy: { created_at: 'desc' }
        });
        return commandes.map((cmd) => {
            // fallback: si pas de commande.produits, on s'assure que produits est null/undefined au lieu de crasher
            return this.formatCommandeResponse(cmd);
        });
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
            where: { client_id: BigInt(utilisateurId) },
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
            // Vérification que client_id est présent et valide
if (!body.id_utilisateur || typeof body.id_utilisateur !== 'string' || body.id_utilisateur.trim() === '') {
                throw new NotFoundException("client_id est obligatoire et doit être une chaîne valide");
            }

            // Vérification que l'utilisateur existe
            const utilisateur = await this.prisma.utilisateurs.findUnique({
                where: { id: BigInt(body.id_utilisateur) }
            });
            if (!utilisateur) {
                throw new NotFoundException(`L'utilisateur avec l'ID ${body.id_utilisateur} n'existe pas`);
            }

            let produitData: any = undefined;
            let prixTotalCalcule: string | null = null;
            if (body.id_produit) {
                const produit = await this.prisma.produits.findUnique({
                    where: { id: BigInt(body.id_produit) }
                });
                if (!produit) {
                    throw new NotFoundException(`Le produit avec l'ID ${body.id_produit} n'existe pas`);
                }

                produitData = {
                    produit_id: BigInt(body.id_produit)
                };
                // Calculer prix_total automatiquement
                const prixUnitaire = parseFloat(produit.prix?.toString() || '0');
                const quantite = body.quantite || 1;
                prixTotalCalcule = (prixUnitaire * quantite).toFixed(2);
            }

            const newCommande = await this.prisma.commandes.create({
                data: {
                    client_id: BigInt(body.id_utilisateur),
                    statut: body.statut || 'en attente',
                    largeur: body.largeur || null,
                    longueur: body.longueur || null,
                    couleur: body.couleur || null,
                    type_bois: body.type_bois || null,
                    ...(body.duree && { duree: body.duree }),
                    ...(body.quantite !== undefined && { quantite: body.quantite }),
                    ...(prixTotalCalcule !== null && { prix_total: prixTotalCalcule }),
                    // Conserver le produit_id dans la table commandes (champ produits_id)
                    ...produitData
                },
                include: {
                    utilisateurs: true,
                    // Important: inclure le produit lié à commandes.produit_id pour afficher le nom côté frontend
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
            const existingCommande = await this.prisma.commandes.findUnique({
                where: { id: BigInt(id) },
                include: { produits: true }
            });
            if (!existingCommande) {
                throw new NotFoundException('Commande not found');
            }

            let produitData: any = undefined;
            let prixTotalCalcule: string | null = null;
            let produit = existingCommande.produits;
            const quantite = body.quantite !== undefined ? body.quantite : existingCommande.quantite ?? 1;

            if (body.id_produit) {
                const produitTrouve = await this.prisma.produits.findUnique({
                    where: { id: BigInt(body.id_produit) }
                });
                if (!produitTrouve) {
                    throw new NotFoundException(`Le produit avec l'ID ${body.id_produit} n'existe pas`);
                }
                produit = produitTrouve;
                produitData = {
                    produit_id: BigInt(body.id_produit)
                };
            }

            if (produit) {
                const prixUnitaire = parseFloat(produit.prix?.toString() || '0');
                prixTotalCalcule = (prixUnitaire * quantite).toFixed(2);
            }

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
                    ...(body.quantite !== undefined && { quantite: body.quantite }),
                    ...(prixTotalCalcule !== null && { prix_total: prixTotalCalcule }),
                    ...produitData
                },
                include: {
                    utilisateurs: true,
                    produits: true,
                    facture: true
                }
            });
            return this.formatCommandeResponse(commande);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException('Commande not found');
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

    // Valider une commande (changer le statut)
    @Put('/api/ValidateCommande/:id')
    public async validateCommande(@Param('id') id: string, @Body() body: { action: string }) {
        try {
            const commande = await this.prisma.commandes.findUnique({
                where: { id: BigInt(id) }
            });

            if (!commande) {
                throw new NotFoundException("Commande not found");
            }

            const oldStatus = commande.statut;
            let newStatus: string;

            switch (body.action) {
                case 'start':
                    if (commande.statut !== 'en attente') {
                        throw new NotFoundException("Commande ne peut pas être démarrée");
                    }
                    newStatus = 'en cours';
                    break;
                case 'complete':
                    if (commande.statut !== 'en cours') {
                        throw new NotFoundException("Commande ne peut pas être terminée");
                    }
                    newStatus = 'terminer';
                    break;
                default:
                    throw new NotFoundException("Action invalide");
            }

            const updatedCommande = await this.prisma.commandes.update({
                where: { id: BigInt(id) },
                data: { statut: newStatus },
                include: {
                    utilisateurs: true,
                    produits: true,
                    facture: true
                }
            });

            // Email uniquement quand on démarre (en attente -> en cours)
            if (body.action === 'start' && oldStatus === 'en attente' && newStatus === 'en cours') {
                const clientEmail = updatedCommande.utilisateurs?.email;

                this.logger.log(
                    `[ValidateCommande] Tentative email: action=${body.action} oldStatus=${oldStatus} newStatus=${newStatus} clientEmail=${clientEmail}`
                );

                if (clientEmail) {
                    const prixTotal =
                        updatedCommande.prix_total?.toString() ?? this.calculatePrixTotal(updatedCommande);

                    try {
                        await this.emailService.sendCommandeStatusEmail({
                            to: clientEmail,
                            commandeId: updatedCommande.id.toString(),
                            prixTotal: prixTotal ?? null,
                            statut: newStatus,
                        });
                    } catch (err) {
                        this.logger.error(`[ValidateCommande] Erreur envoi email: ${String(err)}`);
                    }
                } else {
                    this.logger.warn(
                        `[ValidateCommande] Email client absent => aucun envoi (commande #${updatedCommande.id.toString()})`
                    );
                }
            } else {
                this.logger.log(
                    `[ValidateCommande] Pas d'envoi email: action=${body.action} oldStatus=${oldStatus} newStatus=${newStatus}`
                );
            }

            return this.formatCommandeResponse(updatedCommande);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException("Erreur lors de la validation de la commande");
        }
    }
}