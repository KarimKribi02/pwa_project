import { Controller, Get, Post, Body, Param, NotFoundException, Put, Delete } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { AjouterUtilisateurDto } from "./dtos/ajouterUtilisateur.dto";
import { ModifierUtilisateurDto } from "./dtos/modifierUtilisateur.dto";

@Controller({})
export class UtilisateurController{
    constructor(private prisma: PrismaService){}

    // Afficher tous les utilisateurs
    @Get('/api/AllUtilisateurs')
    public async getAllUtilisateurs(){
        const utilisateurs = await this.prisma.utilisateurs.findMany({
            include: {
                commandes: true
            },
            orderBy: { created_at: 'desc' }
        });
        return utilisateurs.map(user => ({
            ...user,
            id: user.id.toString(),
            commandes: user.commandes?.map(cmd => ({
                ...cmd,
                id: cmd.id.toString(),
                utilisateur_id: cmd.client_id?.toString()
            }))
        }));
    }

    // Afficher un utilisateur par son id
    @Get('/api/SingleUtilisateur/:id')
    public async getUtilisateurById(@Param('id') id: string){
        const utilisateur = await this.prisma.utilisateurs.findUnique({
            where: { id: BigInt(id) },
            include: {
                commandes: true
            }
        });
        if(!utilisateur) throw new NotFoundException("Utilisateur not found");
        return {
            ...utilisateur,
            id: utilisateur.id.toString(),
            commandes: utilisateur.commandes?.map(cmd => ({
                ...cmd,
                id: cmd.id.toString(),
                utilisateur_id: cmd.client_id?.toString()
            }))
        };
    }

    // Afficher un utilisateur par email
    @Get('/api/UtilisateurByEmail/:email')
public async getUtilisateurByEmail(@Param('email') email: string){

    const utilisateur = await this.prisma.utilisateurs.findUnique({
        where: { email }
    });

    if (!utilisateur) {
        throw new NotFoundException("Utilisateur not found");
    }

    return {
        ...utilisateur,
        id: utilisateur.id.toString(),
        nom: utilisateur.nom,
        email: utilisateur.email,
        mot_passe: utilisateur.mot_passe,
        role: utilisateur.role,
    };
}

    // Ajouter un utilisateur
    @Post('/api/addUtilisateur')
    public async addUtilisateur(@Body() body: AjouterUtilisateurDto){
        const newUtilisateur = await this.prisma.utilisateurs.create({
            data: {
                nom: body.nom,
                email: body.email,
                mot_passe: body.mot_passe,
                role: body.role || 'user',
                ...(body.adresse && { adresse: body.adresse }),
                ...(body.telephone && { telephone: body.telephone })
            },
            include: {
                commandes: true
            }
        });
        return {
            ...newUtilisateur,
            id: newUtilisateur.id.toString(),
            commandes: newUtilisateur.commandes?.map(cmd => ({
                ...cmd,
                id: cmd.id.toString(),
                utilisateur_id: cmd.client_id?.toString()
            }))
        };
    }

    // Modifier un utilisateur par id
    @Put('/api/UpdateUtilisateur/:id')
    public async updateUtilisateur(@Param('id') id: string, @Body() body: ModifierUtilisateurDto){
        try {
            const utilisateur = await this.prisma.utilisateurs.update({
                where: { id: BigInt(id) },
                data: {
                    ...(body.nom && { nom: body.nom }),
                    ...(body.email && { email: body.email }),
                    ...(body.mot_passe && { mot_passe: body.mot_passe }),
                    ...(body.role && { role: body.role })
                },
                include: {
                    commandes: true
                }
            });
            return {
                ...utilisateur,
                id: utilisateur.id.toString(),
                commandes: utilisateur.commandes?.map(cmd => ({
                    ...cmd,
                    id: cmd.id.toString(),
                    utilisateur_id: cmd.client_id?.toString()
                }))
            };
        } catch (error) {
            throw new NotFoundException("Utilisateur not found");
        }
    }

    // Supprimer un utilisateur par id
    @Delete('/api/DeleteUtilisateur/:id')
    public async deleteUtilisateur(@Param('id') id: string) {
        try {
            await this.prisma.utilisateurs.delete({
                where: { id: BigInt(id) }
            });
            return {
                message: "Utilisateur supprimé avec succès"
            };
        } catch (error) {
            throw new NotFoundException("Utilisateur not found");
        }
    }
}
