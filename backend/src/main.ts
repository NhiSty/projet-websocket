import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { sessionMiddleware } from './session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Configure express session to handle user session
  app.use(sessionMiddleware(configService));

  await app.listen(8080);
}
bootstrap();