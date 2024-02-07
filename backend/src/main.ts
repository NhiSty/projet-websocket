import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import { Redis } from 'ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const redis = new Redis({
    host: configService.get('REDIS_HOST'),
  });
  const redisStore = new RedisStore({
    client: redis,
    prefix: 'wsp:',
  });

  // Configure express session to handle user session
  app.use(
    session({
      secret: configService.get('APP_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
      store: redisStore,
      name: 'session',
    }),
  );

  await app.listen(8080);
}
bootstrap();
