import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from '@prisma/client';
import { HashService } from '../hash/hash.service';

/**
 * Service responsible for managing user-related operations.
 */
@Injectable()
export class UserService {
  public constructor(
    private databaseService: DatabaseService,
    private hashService: HashService,
  ) {}

  /**
   * Creates a new user with the given username and password.
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns The created user.
   */
  public async create(username: string, password: string): Promise<User> {
    return this.databaseService.user.create({
      data: {
        username,
        password: await this.hashService.hash(password),
      },
    });
  }

  /**
   * Finds a user by their username.
   * @param username - The username of the user to find.
   * @returns The found user, or null if not found.
   */
  public async findByUsername(username: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: {
        username,
      },
    });
  }

  /**
   * Finds a user by their ID.
   * @param id - The ID of the user to find.
   * @returns The found user, or null if not found.
   */
  public async find(id: string): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
      },
    });
  }
}
