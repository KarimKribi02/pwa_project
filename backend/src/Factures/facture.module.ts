import { PrismaService } from "src/prisma.service";
import { FactureController } from "./facture.controller";
import { Module } from "@nestjs/common";


@Module({
    controllers:[FactureController],
    providers:[PrismaService]
})
export class FactureModule{}