import { PrismaService } from "src/prisma.service";
import { CommandeController } from "./commande.controller";
import { Module } from "@nestjs/common/decorators/modules/module.decorator";



@Module({
    controllers:[CommandeController],
    providers:[PrismaService]
})
export class CommandeModule{}