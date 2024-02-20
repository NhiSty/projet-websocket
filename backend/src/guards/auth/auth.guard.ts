import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Auth } from 'src/decorators/auth.decorator';
import {
  AuthService,
  InvalidSessionError,
} from 'src/services/auth/auth.service';
import { Request } from 'express';
import { SessionService } from 'src/services/session/session.service';
import { UserService } from 'src/services/user/user.service';

/**
 * This guard is responsible for checking the authentication status of the user.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private userService: UserService,
    private sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auth = this.reflector.getAllAndOverride(Auth, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req: Request = context.switchToHttp().getRequest();
    const userId = req.session.userId;

    if (userId) {
      const user = await this.userService.find(userId);
      if (!user) {
        this.sessionService.destroy(req);
      }
    }

    if (auth === 'guest') {
      if (userId) {
        return false;
      }

      return true;
    }

    if (auth === 'auth') {
      if (!userId) {
        return false;
      }

      try {
        await this.authService.loadSession(req);
        return true;
      } catch (error) {
        if (error instanceof InvalidSessionError) {
          throw new UnauthorizedException(
            'User not authenticated. Maybe your session has expired',
          );
        }
        return false;
      }
    }

    return true;
  }
}
