import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Auth } from 'src/decorators/auth.decorator';
import {
  AuthService,
  InvalidSessionError,
} from 'src/services/auth/auth.service';
import { Request } from 'express';
import { SessionService } from 'src/services/session/session.service';

/**
 * This guard is responsible for checking the authentication status of the user.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auth = this.reflector.getAllAndOverride(Auth, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req: Request = context.switchToHttp().getRequest();
    const userId = req.session.userId;

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
          throw new ForbiddenException(
            'User not authenticated. Maybe your session has expired',
          );
        }
        return false;
      }
    }

    return true;
  }
}
