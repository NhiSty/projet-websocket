import { Role } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import { Match } from 'src/validation/match.decorator';

/**
 * Data transfer object for creating a user.
 */
export class AdminCreateUserDto {
  /**
   * The username of the user.
   */
  @IsString()
  username: string;

  /**
   * The password of the user.
   */
  @IsString()
  password: string;

  /**
   * The confirmation password of the user.
   * Must match the password field.
   */
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmation: string;

  /**
   * The role of the user.
   */
  @IsEnum(Role)
  role: Role;
}
