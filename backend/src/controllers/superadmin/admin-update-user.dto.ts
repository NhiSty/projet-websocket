import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

/**
 * Data transfer object for creating a user.
 */
export class AdminUpdateUserDto {
  /**
   * The role of the user.
   */
  @IsEnum(Role)
  role: Role;
}
