import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import * as session from 'express-session';
import Redis from 'ioredis';

let middleware: ReturnType<typeof session> | null = null;

const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 DAYS

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
      secure: configService.get<boolean>('SECURE_COOKIE'),
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
    },
    store: redisStore,
    name: 'session',
  });

  return middleware;
}
