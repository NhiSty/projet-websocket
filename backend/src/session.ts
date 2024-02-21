import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import * as session from 'express-session';
import Redis from 'ioredis';

let middleware: ReturnType<typeof session> | null = null;

export function sessionMiddleware(
  configService: ConfigService,
): ReturnType<typeof session> {
  if (middleware) {
    return middleware;
  }

  const redis = new Redis({
    host: configService.get('REDIS_HOST'),
  });
  const redisStore = new RedisStore({
    client: redis,
    prefix: 'wsp:',
  });

  middleware = session({
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
  });

  return middleware;
}