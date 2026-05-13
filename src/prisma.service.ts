import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://postgres.winipbubhxuhmgrakefl:Paw%402002%40Pwa@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Base de données Supabase connectée avec succès !');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
