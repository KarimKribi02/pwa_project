import { Module } from "@nestjs/common";
import { ArticlesCommandeController } from "./articlesCommande.controller";
import { PrismaService } from "src/prisma.service";

@Module({
    controllers: [ArticlesCommandeController],
    providers: [PrismaService]
})
export class ArticlesCommandeModule{}