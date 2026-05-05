import {Module} from '@nestjs/common';
import { ProduitController } from './produit.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [ProduitController],
    providers: [PrismaService]
})
export class ProduitModule{}