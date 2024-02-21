import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/modules/user/controllers/auth/create-user.dto';
import { User } from '@prisma/client';
import { Request } from 'express';
import { SessionService } from '../session/session.service';
import { HashService } from 'src/modules/shared/services/hash/hash.service';
import { UserId } from 'src/types/opaque';

export class InvalidSessionError extends Error {
  public constructor() {
    super('Invalid user session');
  }
}

/**
 * Service responsible for authentication-related operations.
 */
@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService.
   * @param userService - The user service.
   * @param hashService - The hash service.
   */
  public constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Logs in a user with the provided username and password.
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns The authenticated user.
   * @throws UnauthorizedException if the username or password is incorrect.
   */
  public async login(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username);

    if (!user || !(await this.hashService.verify(password, user.password))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  /**
   * Registers a new user with the provided user data.
   * @param user - The user data.
   * @returns The newly created user.
   */
  public async register(user: CreateUserDto) {
    const newUser = await this.userService.create(user.username, user.password);
    return newUser;
  }

  /**
   * Restores a user from the session
   * @param payload - The HTTP session.
   * @returns The restored user.
   */
  public async loadSession(request: Request): Promise<void> {
    const userId = request.session.userId;
    const user = await this.userService.find(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;
  }

  /**
   * Save a user to the session
   * @param request - The HTTP request.
   * @param user - The user
   */
  public async saveSession(
    request: Request,
    user: User,
    regenerate = false,
  ): Promise<void> {
    request.user = user;

    // If "regenerate" is true, the session will be regenerated (destroyed then recreated) to give the user a fresh new one
    if (regenerate) {
      await this.sessionService.regenerate(request);
    }

    request.session.userId = user.id as UserId;
    await this.sessionService.save(request);
  }

  /**
   * Destroy a user session
   * @param request - The HTTP request.
   */
  public async destroySession(request: Request): Promise<void> {
    request.user = null;
    await this.sessionService.destroy(request);
  }
}
