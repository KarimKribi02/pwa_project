import { UtilisateurController } from "./utilisateur.controller";
import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";



@Module({
    controllers:[UtilisateurController],
    providers:[PrismaService]
})
export class UtilisateurModule{}