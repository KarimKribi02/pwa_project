import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller({})
export class ProduitController{

  constructor(private prisma: PrismaService) {}

  // Afficher tous les produits avec leur catégorie
  @Get('/api/AllProduits')
  public async getAllProduits(){
    const produits = await this.prisma.produits.findMany({
      include: {
        categories: true
      },
      orderBy: { created_at: 'desc' }
    });
    return produits.map(produit => ({
      ...produit,
      id: produit.id.toString(),
      categorie_id: produit.categorie_id?.toString(),
      categories: produit.categories ? {
        ...produit.categories,
        id: produit.categories.id.toString()
      } : null
    }));
  }

  // Afficher un produit par son id
  @Get('/api/SingleProduit/:id')
  public async getProduitById(@Param('id') id: string){
    const produit = await this.prisma.produits.findUnique({
      where: { id: BigInt(id) },
      include: {
        categories: true,
        produits_images: true
      }
    });
    if(!produit) throw new NotFoundException("Produit not found");
    return {
      ...produit,
      id: produit.id.toString(),
      categorie_id: produit.categorie_id?.toString(),
      categories: produit.categories ? {
        ...produit.categories,
        id: produit.categories.id.toString()
      } : null,
      produits_images: produit.produits_images?.map(img => ({
        ...img,
        id: img.id.toString(),
        produit_id: img.produit_id?.toString()
      }))
    };
  }

  // Afficher les produits d'une catégorie
  @Get('/api/ProduitsByCategorie/:categorieId')
  public async getProduitsByCategorie(@Param('categorieId') categorieId: string){
    const produits = await this.prisma.produits.findMany({
      where: { categorie_id: BigInt(categorieId) },
      include: {
        categories: true
      },
      orderBy: { created_at: 'desc' }
    });
    return produits.map(produit => ({
      ...produit,
      id: produit.id.toString(),
      categorie_id: produit.categorie_id?.toString(),
      categories: produit.categories ? {
        ...produit.categories,
        id: produit.categories.id.toString()
      } : null
    }));
  }

  // Afficher les produits vedettes
  @Get('/api/ProduitsVedettes')
  public async getProduitsVedettes(){
    const produits = await this.prisma.produits.findMany({
      where: { vedette: true },
      include: {
        categories: true
      },
      orderBy: { created_at: 'desc' }
    });
    return produits.map(produit => ({
      ...produit,
      id: produit.id.toString(),
      categorie_id: produit.categorie_id?.toString(),
      categories: produit.categories ? {
        ...produit.categories,
        id: produit.categories.id.toString()
      } : null
    }));
  }

  // Ajouter un produit
  @Post('/api/addProduit')
  public async addProduit(@Body() body: {
    categorie_id: number;
    nom: string;
    slug?: string;
    description?: string;
    prix?: number;
    vedette?: boolean;
  }){
    const newProduit = await this.prisma.produits.create({
      data: {
        categorie_id: BigInt(body.categorie_id),
        nom: body.nom,
        slug: body.slug,
        description: body.description,
        prix: body.prix ? body.prix.toString() : null,
        vedette: body.vedette || false
      },
      include: {
        categories: true
      }
    });
    return {
      ...newProduit,
      id: newProduit.id.toString(),
      categorie_id: newProduit.categorie_id?.toString(),
      categories: newProduit.categories ? {
        ...newProduit.categories,
        id: newProduit.categories.id.toString()
      } : null
    };
  }

  // Modifier un produit
  @Put('/api/UpdateProduit/:id')
  public async updateProduit(@Param('id') id: string, @Body() body: {
    categorie_id?: number;
    nom?: string;
    slug?: string;
    description?: string;
    prix?: number;
    vedette?: boolean;
  }){
    try {
      const updateData: any = {};
      if (body.categorie_id) updateData.categorie_id = BigInt(body.categorie_id);
      if (body.nom) updateData.nom = body.nom;
      if (body.slug !== undefined) updateData.slug = body.slug;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.prix !== undefined) updateData.prix = body.prix ? body.prix.toString() : null;
      if (body.vedette !== undefined) updateData.vedette = body.vedette;

      const produit = await this.prisma.produits.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: {
          categories: true
        }
      });
      return {
        ...produit,
        id: produit.id.toString(),
        categorie_id: produit.categorie_id?.toString(),
        categories: produit.categories ? {
          ...produit.categories,
          id: produit.categories.id.toString()
        } : null
      };
    } catch (error) {
      throw new NotFoundException("Produit not found");
    }
  }

  // Supprimer un produit
  @Delete('/api/DeleteProduit/:id')
  public async deleteProduit(@Param('id') id: string) {
    try {
      await this.prisma.produits.delete({
        where: { id: BigInt(id) }
      });
      return {
        message: "Produit supprimé avec succès",
      };
    } catch (error) {
      throw new NotFoundException("Produit not found");
    }
  }
}