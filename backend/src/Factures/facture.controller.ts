import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterFactureDto } from "./dtos/ajouterFacture.dto";
import { ModifierFactureDto } from "./dtos/modifierFacture.dto";

@Controller({})
export class FactureController {
  constructor(private prisma: PrismaService) {}

  private generateRandomNumFacture(): string {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FACT-${year}-${randomPart}`;
  }

  private formatFactureResponse(facture: any) {
    return {
      id: facture.id_facture.toString(),
      numFacture: facture.numFacture,
      date_emission: facture.date_emission?.toISOString() || null,
      date_paiement: facture.date_paiement?.toISOString() || null,
      id_commande: facture.id_commande?.toString() || null,
      id_utilisateur: facture.id_utilisateur?.toString() || null,
      created_at: facture.created_at?.toISOString() || null,
      commandes: facture.commandes ? {
        id: facture.commandes.id.toString(),
        statut: facture.commandes.statut,
        utilisateur_id: facture.commandes.utilisateur_id?.toString() || null,
      } : null,
      utilisateurs: facture.utilisateurs ? {
        id: facture.utilisateurs.id.toString(),
        nom: facture.utilisateurs.nom || null,
        email: facture.utilisateurs.email || null,
      } : null,
    };
  }

  @Get('/api/AllFactures')
  public async getAllFactures() {
    const factures = await this.prisma.facture.findMany({
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            utilisateur_id: true,
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
    const facture = await this.prisma.facture.findUnique({
      where: { id_facture: BigInt(id) },
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            utilisateur_id: true,
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
    const factures = await this.prisma.facture.findMany({
      where: { id_commande: BigInt(commandeId) },
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            utilisateur_id: true,
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
    const factures = await this.prisma.facture.findMany({
      where: { id_utilisateur: BigInt(utilisateurId) },
      include: {
        commandes: {
          select: {
            id: true,
            statut: true,
            utilisateur_id: true,
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
      if (!body.id_commande || isNaN(body.id_commande)) {
        throw new BadRequestException('id_commande est obligatoire et doit être un nombre valide');
      }
      if (!body.id_utilisateur || isNaN(body.id_utilisateur)) {
        throw new BadRequestException('id_utilisateur est obligatoire et doit être un nombre valide');
      }

      const commande = await this.prisma.commandes.findUnique({
        where: { id: BigInt(body.id_commande) },
        include: {
          utilisateurs: {
            select: {
              id: true,
              nom: true,
              email: true,
            },
          }
        },
      });

      if (!commande) {
        throw new NotFoundException(`Commande introuvable pour l'ID ${body.id_commande}`);
      }

      if (!commande.utilisateur_id || commande.utilisateur_id.toString() !== body.id_utilisateur.toString()) {
        throw new BadRequestException("Le client de la commande ne correspond pas à l'utilisateur fourni");
      }

      const numeroFacture = this.generateRandomNumFacture();
      const emissionDate = body.date_emission ? new Date(body.date_emission) : new Date();
      const paiementDate = body.date_paiement ? new Date(body.date_paiement) : new Date(emissionDate.getTime() + (commande.duree || 0) * 24 * 60 * 60 * 1000);

      const newFacture = await this.prisma.facture.create({
  data: {
    numFacture: numeroFacture,
    id_commande: BigInt(body.id_commande),
    id_utilisateur: BigInt(body.id_utilisateur),
    date_emission: emissionDate,
    date_paiement: paiementDate,
  },
  include: {
    commandes: {
      select: {
        id: true,
        statut: true,
        utilisateur_id: true,
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
              utilisateur_id: true,
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
