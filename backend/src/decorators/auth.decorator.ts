import { Reflector } from '@nestjs/core';

/**
 * Represents the possible authentication states.
 */
type AuthState = 'auth' | 'guest';

/**
 * Decorator that marks a route or a controller as requiring authentication.
 * It can be used with the `@Auth` decorator to specify the authentication state.
 */
export const Auth = Reflector.createDecorator<never, AuthState>({
  key: 'auth',
  transform: () => 'auth',
});

/**
 * Decorator that marks a route or a controller as allowing guest access.
 * It can be used with the `@Auth` decorator to specify the authentication state.
 */
export const Guest = Reflector.createDecorator<never, AuthState>({
  key: 'auth',
  transform: () => 'guest',
});
