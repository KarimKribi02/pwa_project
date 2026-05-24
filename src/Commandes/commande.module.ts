import { PrismaService } from 'src/prisma.service';
import { CommandeController } from './commande.controller';
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [CommandeController],
  providers: [PrismaService],
  imports: [EmailModule],
})
export class CommandeModule {}
