
import { Module } from '@nestjs/common';
import { CategorieController } from './categorie.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [CategorieController],
    providers: [PrismaService]
})
export class CategorieModule{

}