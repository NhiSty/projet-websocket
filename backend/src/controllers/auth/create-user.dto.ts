import { IsString } from 'class-validator';
import { Match } from 'src/validation/match.decorator';

/**
 * Data transfer object for creating a user.
 */
export class CreateUserDto {
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
}
