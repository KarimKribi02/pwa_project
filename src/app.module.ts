import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategorieModule } from './Categories/categorie.module';
import { ProduitModule } from './Produits/produit.module';
import { PrismaService } from './prisma.service';
import { ImagesProduitModule } from './Images_produit/images_produit.module';
import { UtilisateurModule } from './Utilisateurs/utilisateur.module';
import { CommandeModule } from './Commandes/commande.module';
import { FactureModule } from './Factures/facture.module';
import { ContactModule } from './Contact/contact.module';



@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CategorieModule, ProduitModule, ImagesProduitModule, UtilisateurModule, CommandeModule, FactureModule, ContactModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

