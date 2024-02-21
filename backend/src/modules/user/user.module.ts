import { Module } from '@nestjs/common';
import { RolesGuard } from './guards/role/roles.guard';
import { AuthGuard } from './guards/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { SharedModule } from '../shared/shared.module';
import { AuthController } from './controllers/auth/auth.controller';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';
import { SessionService } from './services/session/session.service';

@Module({
  imports: [SharedModule],
  controllers: [AuthController],
  providers: [
    UserService,
    SessionService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [UserService, SessionService, AuthService],
})
export class UserModule {}