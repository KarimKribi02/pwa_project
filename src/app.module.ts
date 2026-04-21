import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategorieModule } from './Categories/categorie.module';
import { ProduitModule } from './Produits/produit.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [CategorieModule,ProduitModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
