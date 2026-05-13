import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
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
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const uploadPath = join(process.cwd(), 'frontend', 'public', 'images');
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }
                callback(null, uploadPath);
            },
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                callback(null, `product-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
        },
    }))
    public async addImage(
        @UploadedFile() file: Multer.File,
        @Body() body: { produit_id: string; principale?: string }
    ){
        console.log('🔍 addImage called with file:', file?.filename, 'and body:', body);

        // Vérifier que le produit existe
        const produit = await this.prisma.produits.findUnique({
            where: { id: BigInt(body.produit_id) }
        });

        console.log('🔍 Product found:', !!produit, 'with id:', body.produit_id);

        if (!produit) {
            console.log('❌ Product not found with id:', body.produit_id);
            throw new NotFoundException("Produit not found");
        }

        if (!file) {
            console.log('❌ No file uploaded');
            throw new NotFoundException("No image file provided");
        }

        console.log('✅ Product exists, creating image...');

        const imagePath = `/images/${file.filename}`;

        try {
            const principale = body.principale === 'true' || false;

            // Si on veut définir cette image comme principale, on désactive l'ancienne principale
            if (principale) {
                await this.prisma.produits_images.updateMany({
                    where: {
                        produit_id: BigInt(body.produit_id),
                        principale: true,
                    },
                    data: {
                        principale: false,
                    },
                });
            }

            const newImage = await this.prisma.produits_images.create({
                data: {
                    produit_id: BigInt(body.produit_id),
                    url_image: imagePath,
                    principale,
                },
                include: {
                    produits: true
                }
            });


            console.log('✅ Image created successfully with id:', newImage.id.toString());

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
        } catch (error) {
            console.error('❌ Error creating image:', error);
            throw error;
        }
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