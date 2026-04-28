import {Controller, Get, Post,Body, Param, NotFoundException, Put, Delete} from '@nestjs/common';
import { AjouterCategoriedto } from './dtos/ajouterCategorie.dto';
import { ModifierCategorieDto } from './dtos/modifierCategorie.dto';
import { PrismaService } from '../prisma.service';

@Controller({})
export class CategorieController{

  constructor(private prisma: PrismaService) {}

  // Ajouter une Categorie
  @Post('/api/addCategorie')
  public async addCategorie(@Body() body:AjouterCategoriedto){
     const newCategorie = await this.prisma.categories.create({
       data: {
         nom: body.nom,
         slug: body.slug,
         description: body.description
       }
     });
     return {
       ...newCategorie,
       id: newCategorie.id.toString()
     };
  }

  // Afficher toutes les categories
  @Get('/api/AllCategories')
  public async getAllCategories(){
        const categories = await this.prisma.categories.findMany({
          orderBy: { created_at: 'desc' }
        });
        return categories.map(cat => ({
          ...cat,
          id: cat.id.toString()
        }));
  }

  // Afficher une categorie par son id
  @Get('/api/Singlecategorie/:id')
  public async getCategorieById(@Param('id') id:string){
    const categorie = await this.prisma.categories.findUnique({
      where: { id: BigInt(id) }
    });
    if(!categorie) throw new NotFoundException("Categorie not found");
    return {
      ...categorie,
      id: categorie.id.toString()
    };
  }

  // Modifier une categorie par id
  @Put('/api/UpdateCategorie/:id')
  public async updateCategorie(@Param('id') id:string,@Body() body:ModifierCategorieDto){
    try {
      const categorie = await this.prisma.categories.update({
        where: { id: BigInt(id) },
        data: {
          ...(body.nom && { nom: body.nom }),
          ...(body.slug && { slug: body.slug }),
          ...(body.description && { description: body.description })
        }
      });
      return {
        ...categorie,
        id: categorie.id.toString()
      };
    } catch (error) {
      throw new NotFoundException("Categorie not found");
    }
  }

  // Supprimer une categorie par id
  @Delete('/api/DeleteCategorie/:id')
  public async deleteCategorie(@Param('id') id: string) {
    try {
      await this.prisma.categories.delete({
        where: { id: BigInt(id) }
      });
      return {
        message: "Categorie supprimée avec succès",
      };
    } catch (error) {
      throw new NotFoundException("Categorie not found");
    }
  }
}