import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Auth } from 'src/decorators/auth.decorator';
import { AuthService } from 'src/services/auth/auth.service';

/**
 * This guard is responsible for checking the authentication status of the user.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auth = this.reflector.getAllAndOverride(Auth, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const authorization = req.headers['authorization'];

    if (auth === 'guest') {
      if (authorization) {
        return false;
      }

      return true;
    }

    if (auth === 'auth') {
      if (!authorization) {
        return false;
      }

      try {
        const token = authorization.split(' ')[1];
        const payload = this.jwtService.verify(token);

        req.user = await this.authService.restoreFromJwtPayload(payload);

        return true;
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          throw new ForbiddenException('Token has expired');
        }
        return false;
      }
    }

    return true;
  }
}
