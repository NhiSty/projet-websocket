import { Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Paginated } from 'src/types/pagination';
import { DatabaseService } from 'src/modules/shared/services/database/database.service';
import { HashService } from 'src/modules/shared/services/hash/hash.service';
import { UserId } from 'src/types/opaque';

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
   * @param role - The role of the user. (Optional)
   * @returns The created user.
   */
  public async create(
    username: string,
    password: string,
    role?: Role,
  ): Promise<User> {
    return this.databaseService.user.create({
      data: {
        username,
        password: await this.hashService.hash(password),
        role,
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
  public async find(id: UserId): Promise<User | null> {
    return this.databaseService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        globalPoints: true,
      },
    });
  }

  /**
   * Find users with pagination and search.
   * @param search - The search query.
   * @param page - The page number.
   * @returns The found users.
   */
  public async findMany(
    page: number,
    search?: string,
  ): Promise<Paginated<Omit<User, 'password'>>> {
    const totalItems = await this.databaseService.user.count({
      where: {
        username: search && {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    const users = await this.databaseService.user.findMany({
      take: 10,
      skip: (page - 1) * 10,
      where: {
        username: search && {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        username: 'asc',
      },
      select: {
        id: true,
        username: true,
        role: true,
        globalPoints: true,
      },
    });

    const totalPages = Math.ceil(totalItems / 10);

    return {
      items: users,
      totalItems,
      totalPages,
    };
  }

  /**
   * Delete user
   * @param user - The user
   */
  public async delete(user: User): Promise<void> {
    await this.databaseService.user.delete({
      where: {
        id: user.id,
      },
    });
  }

  /**
   * Update user
   * @param user - The user data
   */
  public async update(user: User): Promise<User> {
    return await this.databaseService.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: user.role,
      },
    });
  }

  /**
   * Add points to user
   * @param user - The user
   * @param points - The points to add
   */
  public async addPoints(user: User, points: number): Promise<User> {
    return await this.databaseService.user.update({
      where: {
        id: user.id,
      },
      data: {
        globalPoints: {
          increment: points,
        },
      },
    });
  }
}
