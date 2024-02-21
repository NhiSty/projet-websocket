import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

/**
 * Decorator that can be used to apply roles to a route handler or a controller.
 * @param roles The roles to be applied. Can be a single role or an array of roles.
 */
export const Roles = Reflector.createDecorator<Role | Role[]>();
