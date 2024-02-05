import { IsString } from 'class-validator';

/**
 * Data transfer object for logging in a user.
 */
export class LoginUserDto {
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
}
