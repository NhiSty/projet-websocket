import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { LoginUserDto } from './login-user.dto';
import { CreateUserDto } from './create-user.dto';
import { User } from '@prisma/client';
import { Auth, Guest } from 'src/modules/user/decorators/auth.decorator';
import { Request } from 'express';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Controller responsible for handling authentication related requests.
 */
@Controller('/auth')
@Guest()
export class AuthController {
  public constructor(private authService: AuthService) {}

  /**
   * Retrieves the currently authenticated user.
   * @param request - The request object.
   * @returns The currently authenticated user.
   */
  @Get()
  @Auth()
  public async me(@Req() request: Request): Promise<User> {
    const user = request.user!;
    return {
      ...user,
      password: undefined,
    };
  }

  /**
   * Authenticates a user and generates a user session.
   * @param body - The login user data.
   * @returns An object containing the user data
   */
  @Post()
  @HttpCode(200)
  public async login(
    @Body(new ValidationPipe()) body: LoginUserDto,
    @Req() request: Request,
  ): Promise<User> {
    const user = await this.authService.login(body.username, body.password);
    await this.authService.saveSession(request, user, true);

    return {
      ...user,
      password: undefined,
    };
  }

  /**
   * Registers a new user and generates a user session.
   * @param body - The user registration data.
   * @returns An object containing the user data
   */
  @Post('register')
  public async register(
    @Body(new ValidationPipe()) body: CreateUserDto,
    @Req() request: Request,
  ): Promise<User> {
    const user = await this.authService.register(body);
    await this.authService.saveSession(request, user, true);

    return {
      ...user,
      password: undefined,
    };
  }

  /**
   * Logout the user
   */
  @Delete()
  @Auth()
  @HttpCode(204)
  public async logout(@Req() request: Request): Promise<void> {
    await this.authService.destroySession(request);
  }
}
