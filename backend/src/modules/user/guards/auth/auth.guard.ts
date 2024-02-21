import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { SessionData } from 'express-session';
import { IncomingMessage } from 'http';
import { Socket } from 'socket.io';
import { UserService } from 'src/modules/user/services/user/user.service';

@Injectable()
export class AuthWsGuard implements CanActivate {
  public constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToWs().getClient<Socket>()
      .request as IncomingMessage & { session: SessionData; user?: User };

    const userId = req.session.userId;

    if (userId) {
      const user = await this.userService.find(userId);
      if (!user) {
        throw new ForbiddenException('User not found');
      }
    }

    try {
      const userId = req.session.userId;
      const user = await this.userService.find(userId);

      if (!user) {
        throw new UnauthorizedException();
      }

      req.user = user;
    } catch (error) {
      return false;
    }

    return true;
  }
}