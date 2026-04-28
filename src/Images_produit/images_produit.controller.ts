import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterImageDto } from "./dtos/ajouterImage.dto";
import { ModifierImageDto } from "./dtos/modifierImage.dto";

@Controller({})
export class ImagesProduitController {
    constructor(private prisma: PrismaService){}

    // Afficher toutes les images
    @Get('/api/AllImages')
    public async getAllImages(){
        const images = await this.prisma.produits_images.findMany({
            include: {
                produits: true
            },
            orderBy: { created_at: 'desc' }
        });
        return images.map(img => ({
            ...img,
            id: img.id.toString(),
            produit_id: img.produit_id?.toString(),
            produits: img.produits ? {
                ...img.produits,
                id: img.produits.id.toString(),
                categorie_id: img.produits.categorie_id?.toString()
            } : null
        }));
    }

    // Afficher une image par son id
    @Get('/api/SingleImage/:id')
    public async getImageById(@Param('id') id: string){
        const image = await this.prisma.produits_images.findUnique({
            where: { id: BigInt(id) },
            include: {
                produits: true
            }
        });
        if(!image) throw new NotFoundException("Image not found");
        return {
            ...image,
            id: image.id.toString(),
            produit_id: image.produit_id?.toString(),
            produits: image.produits ? {
                ...image.produits,
                id: image.produits.id.toString(),
                categorie_id: image.produits.categorie_id?.toString()
            } : null
        };
    }

    // Afficher les images d'un produit
    @Get('/api/ImagesByProduit/:produitId')
    public async getImagesByProduit(@Param('produitId') produitId: string){
        const images = await this.prisma.produits_images.findMany({
            where: { produit_id: BigInt(produitId) },
            include: {
                produits: true
            },
            orderBy: { created_at: 'desc' }
        });
        return images.map(img => ({
            ...img,
            id: img.id.toString(),
            produit_id: img.produit_id?.toString(),
            produits: img.produits ? {
                ...img.produits,
                id: img.produits.id.toString(),
                categorie_id: img.produits.categorie_id?.toString()
            } : null
        }));
    }

    // Ajouter une image
    @Post('/api/addImage')
    public async addImage(@Body() body: AjouterImageDto){
        const newImage = await this.prisma.produits_images.create({
            data: {
                produit_id: BigInt(body.produit_id),
                url_image: body.url_image,
                principale: body.principale || false
            },
            include: {
                produits: true
            }
        });
        return {
            ...newImage,
            id: newImage.id.toString(),
            produit_id: newImage.produit_id?.toString(),
            produits: newImage.produits ? {
                ...newImage.produits,
                id: newImage.produits.id.toString(),
                categorie_id: newImage.produits.categorie_id?.toString()
            } : null
        };
    }

    // Modifier une image par id
    @Put('/api/UpdateImage/:id')
    public async updateImage(@Param('id') id: string, @Body() body: ModifierImageDto){
        try {
            const image = await this.prisma.produits_images.update({
                where: { id: BigInt(id) },
                data: {
                    ...(body.url_image && { url_image: body.url_image }),
                    ...(body.principale !== undefined && { principale: body.principale })
                },
                include: {
                    produits: true
                }
            });
            return {
                ...image,
                id: image.id.toString(),
                produit_id: image.produit_id?.toString(),
                produits: image.produits ? {
                    ...image.produits,
                    id: image.produits.id.toString(),
                    categorie_id: image.produits.categorie_id?.toString()
                } : null
            };
        } catch (error) {
            throw new NotFoundException("Image not found");
        }
    }

    // Supprimer une image par id
    @Delete('/api/DeleteImage/:id')
    public async deleteImage(@Param('id') id: string) {
        try {
            await this.prisma.produits_images.delete({
                where: { id: BigInt(id) }
            });
            return {
                message: "Image supprimée avec succès"
            };
        } catch (error) {
            throw new NotFoundException("Image not found");
        }
    }
}