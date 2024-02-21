import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';
import { Roles } from 'src/modules/user/decorators/roles.decorator';

/**
 * A guard that checks if a user has the required roles to access a resource.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    return this.matchRoles(roles, user.role);
  }

  /**
   * Checks if the user role matches the required roles.
   * @param roles - The required roles.
   * @param userRole - The user's role.
   * @returns A boolean indicating if the user role matches the required roles.
   */
  private matchRoles(roles: Role | Role[], userRole: Role): boolean {
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  }
}
