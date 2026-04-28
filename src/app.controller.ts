import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-test')
  async testDb() {
    try {
      // Exécute une requête simple pour tester la connexion (ici on compte les tables disponibles ou on vérifie juste que ça tourne)
      await this.prisma.$queryRaw`SELECT 1`;
      return { 
        success: true, 
        message: 'La base de données Supabase est connectée avec succès !'
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Erreur de connexion', 
        error: error.message 
      };
    }
  }
}
