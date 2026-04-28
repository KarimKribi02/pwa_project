import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterFactureDto } from "./dtos/ajouterFacture.dto";
import { ModifierFactureDto } from "./dtos/modifierFacture.dto";

@Controller({})
export class FactureController {
  constructor(private prisma: PrismaService) {}

  private generateRandomNumeroFacture(): string {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FACT-${year}-${randomPart}`;
  }

  private calculateMontantTotal(articles: any[]): string {
    if (!articles || articles.length === 0) return '0';
    const total = articles.reduce((sum, article) => {
      const quantite = parseFloat(article.quantite || 0);
      const prixProduit = article.produits?.prix ? parseFloat(article.produits.prix.toString()) : parseFloat(article.prix || 0);
      return sum + quantite * prixProduit;
    }, 0);
    return total.toFixed(2);
  }

  private formatFactureResponse(facture: any) {
    const commande = facture.commandes;
    const utilisateur = facture.utilisateurs;

    return {
      id: facture.id.toString(),
      commande_id: facture.commande_id?.toString() || null,
      utilisateur_id: facture.utilisateur_id?.toString() || null,
      numero_facture: facture.numero_facture,
      date_emission: facture.date_emission?.toISOString() || null,
      date_paiement: facture.date_paiement?.toISOString() || null,
      montant_totale: facture.montant_totale?.toString() || '0',
      statut: facture.statut,
      nomcomplete: facture.nomcomplete,
      adresse: facture.adresse,
      telephone: facture.telephone,
      email: facture.email,
      created_at: facture.created_at?.toISOString() || null,
      commandes: commande
        ? {
            id: commande.id.toString(),
            statut: commande.statut,
            prix_total: commande.prix_total?.toString() || '0',
            client_id: commande.client_id?.toString() || null,
          }
        : null,
      utilisateurs: utilisateur
        ? {
            id: utilisateur.id.toString(),
            nomcomplete: utilisateur.nom || null,
            email: utilisateur.email,
            adresse: utilisateur.adresse || null,
            telephone: utilisateur.telephone || null,
          }
        : null,
    };
  }

  @Get('/api/AllFactures')
  public async getAllFactures() {
    const factures = await (this.prisma.facture as any).findMany({
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            prix_total: true,
            client_id: true,
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return factures.map((facture) => this.formatFactureResponse(facture));
  }

  @Get('/api/SingleFacture/:id')
  public async getFactureById(@Param('id') id: string) {
    const facture = await (this.prisma.facture as any).findUnique({
      where: { id: BigInt(id) },
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            prix_total: true,
            client_id: true,
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
          },
        },
      },
    });
    if (!facture) throw new NotFoundException('Facture not found');
    return this.formatFactureResponse(facture);
  }

  @Get('/api/FacturesByCommande/:commandeId')
  public async getFacturesByCommande(@Param('commandeId') commandeId: string) {
    const factures = await (this.prisma.facture as any).findMany({
      where: { commande_id: BigInt(commandeId) },
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            prix_total: true,
            client_id: true,
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return factures.map((facture) => this.formatFactureResponse(facture));
  }

  @Get('/api/FacturesByUtilisateur/:utilisateurId')
  public async getFacturesByUtilisateur(@Param('utilisateurId') utilisateurId: string) {
    const factures = await (this.prisma.facture as any).findMany({
      where: { utilisateur_id: BigInt(utilisateurId) },
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            prix_total: true,
            client_id: true,
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return factures.map((facture) => this.formatFactureResponse(facture));
  }

  @Post('/api/addFacture')
  public async addFacture(@Body() body: AjouterFactureDto) {
    try {
      if (!body.commande_id || isNaN(body.commande_id)) {
        throw new BadRequestException('commande_id est obligatoire et doit être un nombre valide');
      }
      if (!body.utilisateur_id || isNaN(body.utilisateur_id)) {
        throw new BadRequestException('utilisateur_id est obligatoire et doit être un nombre valide');
      }

      const commande = await this.prisma.commandes.findUnique({
        where: { id: BigInt(body.commande_id) },
        include: {
          utilisateurs: {
            select: {
              id: true,
              nom: true,
              email: true,
            },
          },
          articles_commandes: {
            include: {
              produits: true,
            },
          },
        },
      });

      if (!commande) {
        throw new NotFoundException(`Commande introuvable pour l'ID ${body.commande_id}`);
      }

      if (!commande.client_id || commande.client_id.toString() !== body.utilisateur_id.toString()) {
        throw new BadRequestException("Le client de la commande ne correspond pas à l'utilisateur fourni");
      }

      const utilisateur = await this.prisma.utilisateurs.findUnique({
        where: { id: BigInt(body.utilisateur_id) },
      });
      const utilisateurData = utilisateur as any;
      if (!utilisateur) {
        throw new NotFoundException(`Utilisateur introuvable pour l'ID ${body.utilisateur_id}`);
      }

      const montantTotale = commande.prix_total?.toString() || this.calculateMontantTotal(commande.articles_commandes || []);
      const numeroFacture = this.generateRandomNumeroFacture();

      const newFacture = await this.prisma.facture.create({
        data: {
          commande_id: BigInt(body.commande_id),
          utilisateur_id: BigInt(body.utilisateur_id),
          numero_facture: numeroFacture,
          date_emission: body.date_emission ? new Date(body.date_emission) : new Date(),
          date_paiement: body.date_paiement ? new Date(body.date_paiement) : null,
          montant_totale: montantTotale,
          statut: commande.statut || 'en attente',
          nomcomplete: utilisateurData.nom || null,
          adresse: utilisateurData.adresse || null,
          telephone: utilisateurData.telephone || null,
          email: utilisateurData.email || null,
        },
        include: {
          commandes: {
            select: {
              id: true,
              statut: true,
              prix_total: true,
              client_id: true,
            },
          },
          utilisateurs: {
            select: {
              id: true,
              nom: true,
              email: true,
            },
          },
        },
      });

      return this.formatFactureResponse(newFacture);
    } catch (error) {
      console.error('Error creating facture:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new BadRequestException(`Erreur lors de la création de la facture: ${message}`);
    }
  }

  @Put('/api/UpdateFacture/:id')
  public async updateFacture(@Param('id') id: string, @Body() body: ModifierFactureDto) {
    try {
      const facture = await (this.prisma.facture as any).update({
        where: { id: BigInt(id) },
        data: {
          ...(body.date_emission && { date_emission: new Date(body.date_emission) }),
          ...(body.date_paiement && { date_paiement: new Date(body.date_paiement) }),
        },
        include: {
          commandes: {
            select: {
              id: true,
              statut: true,
              prix_total: true,
              client_id: true,
            },
          },
          utilisateurs: {
            select: {
              id: true,
              nom: true,
              email: true,
            },
          },
        },
      });
      return this.formatFactureResponse(facture);
    } catch (error) {
      throw new NotFoundException('Facture introuvable');
    }
  }

  @Delete('/api/DeleteFacture/:id')
  public async deleteFacture(@Param('id') id: string) {
    try {
      await (this.prisma.facture as any).delete({
        where: { id: BigInt(id) },
      });
      return {
        message: 'Facture supprimée avec succès',
      };
    } catch (error) {
      throw new NotFoundException('Facture introuvable');
    }
  }
}
