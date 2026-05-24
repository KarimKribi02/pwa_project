import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete, BadRequestException, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ModifierFactureDto } from "./dtos/modifierFacture.dto";

@Controller({})
export class FactureController {
  constructor(private prisma: PrismaService) {}

  private generateRandomNumFacture(): string {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FACT-${year}-${randomPart}`;
  }

  private calculateMontantCommande(commande: any): number {
    if (!commande.items || !Array.isArray(commande.items)) {
      return 0;
    }
    let total = 0;
    for (const item of commande.items) {
      const prix = item.produit?.prix ? parseFloat(item.produit.prix.toString()) : 0;
      const quantite = item.quantite ?? 1;
      total += prix * quantite;
    }
    return total;
  }

  private formatFactureResponse(facture: any) {
    return {
      id: facture.id.toString(),
      numero_facture: facture.numero_facture || null,
      date_emission: facture.date_emission?.toISOString() || null,
      date_paiement: facture.date_paiement?.toISOString() || null,
      id_commande: facture.commande_id?.toString() || null,
      id_utilisateur: facture.utilisateur_id?.toString() || null,
      montant_totale: facture.montant_totale ? facture.montant_totale.toString() : '0',
      statut: facture.statut || null,
      nomcomplete: facture.nomcomplete || null,
      adresse: facture.adresse || null,
      telephone: facture.telephone || null,
      email: facture.email || null,
      created_at: facture.created_at?.toISOString() || null,
      commandes: facture.commandes ? {
        id: facture.commandes.id.toString(),
        statut: facture.commandes.statut,
        client_id: facture.commandes.client_id?.toString() || null,
        produit_id: (facture.commandes.items && facture.commandes.items.length > 0)
          ? facture.commandes.items[0].produit_id?.toString() || null
          : null,
        produits: (facture.commandes.items && facture.commandes.items.length > 0 && facture.commandes.items[0].produit) ? {
          id: facture.commandes.items[0].produit.id.toString(),
          nom: facture.commandes.items[0].produit.nom || null,
          slug: facture.commandes.items[0].produit.slug || null,
          description: facture.commandes.items[0].produit.description || null,
          categorie_id: facture.commandes.items[0].produit.categorie_id?.toString() || null,
          prix: facture.commandes.items[0].produit.prix?.toString() || null,
          vedette: facture.commandes.items[0].produit.vedette ?? false,
          created_at: facture.commandes.items[0].produit.created_at ? facture.commandes.items[0].produit.created_at.toISOString() : null,
        } : null,
        articles: (facture.commandes.items || []).map((item: any) => ({
          id: item.id.toString(),
          produit_id: item.produit_id?.toString() || null,
          nom: item.produit?.nom || null,
          quantite: item.quantite || 1,
          prix: item.produit?.prix?.toString() || null,
          prix_total_ligne: item.produit?.prix
            ? (parseFloat(item.produit.prix.toString()) * (item.quantite ?? 1)).toFixed(2)
            : '0',
        }))
      } : null,
      utilisateurs: facture.utilisateurs ? {
        id: facture.utilisateurs.id.toString(),
        nom: facture.utilisateurs.nom || null,
        email: facture.utilisateurs.email || null,
        adresse: facture.utilisateurs.adresse || null,
        telephone: facture.utilisateurs.telephone || null,
      } : null,
    };
  }

  @Get('/api/AllFactures')
  public async getAllFactures() {
    const factures = await this.prisma.facture.findMany({
      include: {
        commandes: {
          include: {
            items: {
              include: {
                produit: true
              }
            }
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
            adresse: true,
            telephone: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return factures.map((facture) => this.formatFactureResponse(facture));
  }

  @Get('/api/SingleFacture/:id')
  public async getFactureById(@Param('id') id: string) {
    const facture = await this.prisma.facture.findUnique({
      where: { id: BigInt(id) },
      include: {
        commandes: {
          include: {
            items: {
              include: {
                produit: true
              }
            }
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
            adresse: true,
            telephone: true,
          },
        },
      },
    });
    if (!facture) throw new NotFoundException('Facture not found');
    return this.formatFactureResponse(facture);
  }

  @Get('/api/FacturesByCommande/:commandeId')
  public async getFacturesByCommande(@Param('commandeId') commandeId: string) {
    const factures = await this.prisma.facture.findMany({
      where: { commande_id: BigInt(commandeId) },
      include: {
        commandes: {
          include: {
            items: {
              include: {
                produit: true
              }
            }
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
            adresse: true,
            telephone: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return factures.map((facture) => this.formatFactureResponse(facture));
  }

  @Get('/api/FacturesByUtilisateur/:utilisateurId')
  public async getFacturesByUtilisateur(@Param('utilisateurId') utilisateurId: string) {
    const factures = await this.prisma.facture.findMany({
      where: { utilisateur_id: BigInt(utilisateurId) },
      include: {
        commandes: {
          include: {
            items: {
              include: {
                produit: true
              }
            }
          },
        },
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            email: true,
            adresse: true,
            telephone: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    return factures.map((facture) => this.formatFactureResponse(facture));
  }

  @Post('/api/addFacture')
  public async addFacture(
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: false })) body: any,
  ) {
    try {
      const id_commande = Number(body.id_commande);
      const id_utilisateur = Number(body.id_utilisateur);

      if (!id_commande || isNaN(id_commande)) {
        throw new BadRequestException('id_commande est obligatoire et doit être un nombre valide');
      }
      if (!id_utilisateur || isNaN(id_utilisateur)) {
        throw new BadRequestException('id_utilisateur est obligatoire et doit être un nombre valide');
      }

      const commande = await this.prisma.commandes.findUnique({
        where: { id: BigInt(body.id_commande) },
        include: {
          items: {
            include: {
              produit: true
            }
          }
        },
      });

      if (!commande) {
        throw new NotFoundException(`Commande introuvable pour l'ID ${body.id_commande}`);
      }

      if (commande.client_id && commande.client_id.toString() !== body.id_utilisateur.toString()) {
        throw new BadRequestException("Le client de la commande ne correspond pas à l'utilisateur fourni");
      }

      const numeroFacture = this.generateRandomNumFacture();
      const emissionDate = body.date_emission ? new Date(body.date_emission) : new Date();
      const paiementDate = body.date_paiement ? new Date(body.date_paiement) : new Date();
      const montantTotale = this.calculateMontantCommande(commande);

      const newFacture = await this.prisma.facture.create({
        data: {
          numero_facture: numeroFacture,
          commande_id: BigInt(id_commande),
          utilisateur_id: BigInt(id_utilisateur),
          date_emission: emissionDate,
          date_paiement: paiementDate,
          montant_totale: montantTotale,
          statut: 'En attente',
          nomcomplete: commande.clientNom || null,
          adresse: commande.adresse || null,
          telephone: commande.clientTel || null,
          email: commande.clientEmail || null,
        },
        include: {
          commandes: {
            include: {
              items: {
                include: {
                  produit: true
                }
              }
            },
          },
          utilisateurs: {
            select: {
              id: true,
              nom: true,
              email: true,
              adresse: true,
              telephone: true,
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
      const facture = await this.prisma.facture.update({
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
      await this.prisma.facture.delete({
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
