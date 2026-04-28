import { Module } from "@nestjs/common";
import { ImagesProduitController } from "./images_produit.controller";
import { PrismaService } from "src/prisma.service";



@Module({
    controllers:[ImagesProduitController],
    providers:[PrismaService]
})
export class ImagesProduitModule{}