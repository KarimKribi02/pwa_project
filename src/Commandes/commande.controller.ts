import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterCommandeDto } from "./dtos/ajouterCommande.dto";
import { ModifierCommandeDto } from "./dtos/modifierCommande.dto";
import { EmailService, type EmailNotificationResult } from "src/email/email.service";
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
        if (!commande.items || !Array.isArray(commande.items)) {
            return "0";
        }
        let total = 0;
        for (const item of commande.items) {
            const produitPrix = item.produit?.prix ? parseFloat(item.produit.prix.toString()) : 0;
            const quantite = item.quantite ?? 1;
            total += produitPrix * quantite;
        }
        return total.toFixed(2);
    }

    private generateTrackingCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `MD-2026-${result}`;
    }

    private withEmailNotification(
        response: Record<string, unknown>,
        emailNotification: EmailNotificationResult,
    ) {
        return { ...response, email_notification: emailNotification };
    }

    // Fonction utilitaire pour formater la réponse commande
    private formatCommandeResponse(commande: any) {
        const factures = commande.facture || [];
        const prixTotal = this.calculatePrixTotal(commande);
        
        // Simuler la structure de l'utilisateur pour la compatibilité avec le frontend
        const utilisateurs = commande.clientNom || commande.clientTel || commande.clientEmail || commande.adresse ? {
            id: commande.client_id?.toString() || "0",
            nom: commande.clientNom || null,
            email: commande.clientEmail || null,
            telephone: commande.clientTel || null,
            role: "client",
            adresse: commande.adresse || null,
            created_at: null
        } : null;

        // Simuler la structure du produit (le premier item) pour la compatibilité avec le frontend
        const firstItem = commande.items && commande.items.length > 0 ? commande.items[0] : null;
        const produits = firstItem?.produit ? {
            id: firstItem.produit.id.toString(),
            nom: firstItem.produit.nom || null,
            slug: firstItem.produit.slug || null,
            description: firstItem.produit.description || null,
            categorie_id: firstItem.produit.categorie_id?.toString() || null,
            prix: firstItem.produit.prix?.toString() || null,
            vedette: firstItem.produit.vedette ?? false,
            created_at: firstItem.produit.created_at ? firstItem.produit.created_at.toISOString() : null
        } : null;

        const quantite = firstItem?.quantite ?? 1;

        return {
            id: commande.id.toString(),
            code_suivi: commande.codeSuivi || null,
            client_id: commande.client_id?.toString() || null,
            produit_id: firstItem?.produit_id?.toString() || null,
            statut: commande.statut || null,
            note: commande.note || null,
            created_at: commande.created_at ? commande.created_at.toISOString() : null,
            largeur: commande.largeur || null,
            longueur: commande.longueur || null,
            couleur: commande.couleur || null,
            type_bois: commande.type_bois || null,
            duree: commande.duree || null,
            quantite: quantite,
            prix_total: prixTotal,
            clientNom: commande.clientNom || null,
            clientTel: commande.clientTel || null,
            clientEmail: commande.clientEmail || null,
            adresse: commande.adresse || null,
            utilisateurs: utilisateurs,
            produits: produits,
            items: (commande.items || []).map((item: any) => ({
                id: item.id.toString(),
                commande_id: item.commande_id?.toString() || null,
                produit_id: item.produit_id?.toString() || null,
                quantite: item.quantite ?? 1,
                produit: item.produit ? {
                    id: item.produit.id.toString(),
                    nom: item.produit.nom || null,
                    slug: item.produit.slug || null,
                    description: item.produit.description || null,
                    categorie_id: item.produit.categorie_id?.toString() || null,
                    prix: item.produit.prix?.toString() || null,
                    vedette: item.produit.vedette ?? false,
                    created_at: item.produit.created_at ? item.produit.created_at.toISOString() : null
                } : null
            })),
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
                items: {
                    include: {
                        produit: true
                    }
                },
                facture: true
            },
            orderBy: { created_at: 'desc' }
        });
        return commandes.map((cmd) => {
            return this.formatCommandeResponse(cmd);
        });
    }

    // Afficher une commande par son id
    @Get('/api/SingleCommande/:id')
    public async getCommandeById(@Param('id') id: string) {
        const commande = await this.prisma.commandes.findUnique({
            where: { id: BigInt(id) },
            include: {
                items: {
                    include: {
                        produit: true
                    }
                },
                facture: true
            }
        });
        if (!commande) throw new NotFoundException("Commande not found");
        return this.formatCommandeResponse(commande);
    }

    // Suivi de commande par son code de suivi
    @Get('/api/commandes/suivi/:code')
    public async getCommandeSuivi(@Param('code') code: string) {
        const commande = await this.prisma.commandes.findUnique({
            where: { codeSuivi: code },
            include: {
                items: {
                    include: {
                        produit: true
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
                items: {
                    include: {
                        produit: true
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
                items: {
                    include: {
                        produit: true
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
            let clientNom = body.clientNom;
            let clientTel = body.clientTel;
            let clientEmail = body.clientEmail;
            let adresse = body.adresse;
            let clientId: bigint | null = null;

            if (body.id_utilisateur) {
                clientId = BigInt(body.id_utilisateur);
                const utilisateur = await this.prisma.utilisateurs.findUnique({
                    where: { id: clientId }
                });
                if (utilisateur) {
                    clientNom = clientNom || utilisateur.nom || undefined;
                    clientTel = clientTel || utilisateur.telephone || undefined;
                    clientEmail = clientEmail || utilisateur.email || undefined;
                    adresse = adresse || utilisateur.adresse || undefined;
                }
            }

            let itemsCreateInput: any = undefined;
            let prixTotalCalcule: string | null = null;

            if (body.id_produit) {
                const produit = await this.prisma.produits.findUnique({
                    where: { id: BigInt(body.id_produit) }
                });
                if (!produit) {
                    throw new NotFoundException(`Le produit avec l'ID ${body.id_produit} n'existe pas`);
                }

                const quantite = body.quantite || 1;
                const prixUnitaire = parseFloat(produit.prix?.toString() || '0');
                prixTotalCalcule = (prixUnitaire * quantite).toFixed(2);

                itemsCreateInput = {
                    create: [
                        {
                            produit_id: BigInt(body.id_produit),
                            quantite: quantite
                        }
                    ]
                };
            }

            const codeSuivi = this.generateTrackingCode();

            const newCommande = await this.prisma.commandes.create({
                data: {
                    client_id: clientId,
                    codeSuivi: codeSuivi,
                    clientNom: body.clientNom || clientNom || (body as any).name || null,
                    clientTel: body.clientTel || clientTel || (body as any).phone || null,
                    clientEmail: body.clientEmail || clientEmail || (body as any).email || null,
                    adresse: body.adresse || adresse || null,
                    statut: body.statut || 'en attente',
                    largeur: body.largeur || (body as any).width || null,
                    longueur: body.longueur || (body as any).length || null,
                    couleur: body.couleur || (body as any).color || null,
                    type_bois: body.type_bois || (body as any).typeBois || null,
                    note: body.note || null,
                    ...(body.duree && { duree: body.duree }),
                    prix_total: prixTotalCalcule || (body.prix_total ? body.prix_total.toString() : null),
                    ...(itemsCreateInput && { items: itemsCreateInput })
                },
                include: {
                    items: {
                        include: {
                            produit: true
                        }
                    },
                    facture: true
                }
            });

            let emailNotification: EmailNotificationResult;
            if (newCommande.clientEmail) {
                emailNotification = await this.emailService.sendOrderConfirmation(
                    newCommande.clientEmail,
                    newCommande.clientNom || 'Client',
                    codeSuivi,
                );
                if (!emailNotification.sent) {
                    this.logger.warn(`[addCommande] ${emailNotification.message}`);
                }
            } else {
                emailNotification = {
                    sent: false,
                    message: 'Aucune adresse email fournie — confirmation non envoyée.',
                };
            }

            return this.withEmailNotification(
                this.formatCommandeResponse(newCommande),
                emailNotification,
            );
        } catch (error) {
            this.logger.error(
                `[addCommande] Erreur création commande: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
            );
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
                include: {
                    items: {
                        include: {
                            produit: true
                        }
                    }
                }
            });
            if (!existingCommande) {
                throw new NotFoundException('Commande not found');
            }

            let itemsUpdateInput: any = undefined;
            let prixTotalCalcule: string | null = null;
            const firstItem = existingCommande.items?.[0];
            let product = firstItem?.produit;
            const quantite = body.quantite !== undefined ? body.quantite : (firstItem?.quantite ?? 1);

            if (body.id_produit) {
                const produitTrouve = await this.prisma.produits.findUnique({
                    where: { id: BigInt(body.id_produit) }
                });
                if (!produitTrouve) {
                    throw new NotFoundException(`Le produit avec l'ID ${body.id_produit} n'existe pas`);
                }
                product = produitTrouve;

                if (firstItem) {
                    itemsUpdateInput = {
                        update: {
                            where: { id: firstItem.id },
                            data: {
                                produit_id: BigInt(body.id_produit),
                                quantite: quantite
                            }
                        }
                    };
                } else {
                    itemsUpdateInput = {
                        create: [
                            {
                                produit_id: BigInt(body.id_produit),
                                quantite: quantite
                            }
                        ]
                    };
                }
            } else if (body.quantite !== undefined && firstItem) {
                itemsUpdateInput = {
                    update: {
                        where: { id: firstItem.id },
                        data: {
                            quantite: quantite
                        }
                    }
                };
            }

            if (product) {
                const prixUnitaire = parseFloat(product.prix?.toString() || '0');
                prixTotalCalcule = (prixUnitaire * quantite).toFixed(2);
            }

            const updatedCommande = await this.prisma.commandes.update({
                where: { id: BigInt(id) },
                data: {
                    clientNom: body.clientNom !== undefined ? body.clientNom : existingCommande.clientNom,
                    clientTel: body.clientTel !== undefined ? body.clientTel : existingCommande.clientTel,
                    clientEmail: body.clientEmail !== undefined ? body.clientEmail : existingCommande.clientEmail,
                    adresse: body.adresse !== undefined ? body.adresse : existingCommande.adresse,
                    ...(body.statut && { statut: body.statut }),
                    ...(body.note && { note: body.note }),
                    ...(body.largeur && { largeur: body.largeur }),
                    ...(body.longueur && { longueur: body.longueur }),
                    ...(body.couleur && { couleur: body.couleur }),
                    ...(body.type_bois && { type_bois: body.type_bois }),
                    ...(body.duree && { duree: body.duree }),
                    ...(prixTotalCalcule !== null && { prix_total: prixTotalCalcule }),
                    ...(itemsUpdateInput && { items: itemsUpdateInput })
                },
                include: {
                    items: {
                        include: {
                            produit: true
                        }
                    },
                    facture: true
                }
            });

            let emailNotification: EmailNotificationResult | null = null;
            if (body.statut && body.statut !== existingCommande.statut) {
                emailNotification = await this.emailService.sendStatusUpdate(
                    updatedCommande.clientEmail,
                    updatedCommande.clientNom || 'Client',
                    updatedCommande.codeSuivi,
                    updatedCommande.statut,
                );
                if (!emailNotification.sent) {
                    this.logger.warn(`[updateCommande] ${emailNotification.message}`);
                }
            }

            const response = this.formatCommandeResponse(updatedCommande);
            return emailNotification
                ? this.withEmailNotification(response, emailNotification)
                : response;
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
                where: { id: BigInt(id) },
                include: {
                    items: {
                        include: {
                            produit: true
                        }
                    }
                }
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
                    items: {
                        include: {
                            produit: true
                        }
                    },
                    facture: true
                }
            });

            let emailNotification: EmailNotificationResult | null = null;
            if (newStatus !== oldStatus) {
                emailNotification = await this.emailService.sendStatusUpdate(
                    updatedCommande.clientEmail,
                    updatedCommande.clientNom || 'Client',
                    updatedCommande.codeSuivi,
                    updatedCommande.statut,
                );
                if (!emailNotification.sent) {
                    this.logger.warn(`[ValidateCommande] ${emailNotification.message}`);
                }
            }

            const response = this.formatCommandeResponse(updatedCommande);
            return emailNotification
                ? this.withEmailNotification(response, emailNotification)
                : response;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException("Erreur lors de la validation de la commande");
        }
    }
}