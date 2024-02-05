import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { HashService } from '../hash/hash.service';
import { CreateUserDto } from 'src/controllers/auth/create-user.dto';
import { User } from '@prisma/client';

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
   * Restores a user from the JWT payload.
   * @param payload - The JWT payload.
   * @returns The restored user.
   */
  public async restoreFromJwtPayload(payload: { sub: string }): Promise<User> {
    return this.userService.find(payload.sub);
  }
}
