import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Active le CORS pour permettre les requêtes du frontend
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
