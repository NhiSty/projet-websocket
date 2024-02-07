import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './services/database/database.service';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { HashService } from './services/hash/hash.service';
import * as Joi from 'joi';
import { AuthController } from './controllers/auth/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/role/roles.guard';
import { AuthGuard } from './guards/auth/auth.guard';
import { SessionService } from './services/session/session.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        APP_SECRET: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
      }),
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    DatabaseService,
    UserService,
    AuthService,
    HashService,
    SessionService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
