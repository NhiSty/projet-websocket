import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { LoginUserDto } from './login-user.dto';
import { CreateUserDto } from './create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Auth, Guest } from 'src/decorators/auth.decorator';

/**
 * Controller responsible for handling authentication related requests.
 */
@Controller('/auth')
@Guest()
export class AuthController {
  public constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  /**
   * Retrieves the currently authenticated user.
   * @param request - The request object.
   * @returns The currently authenticated user.
   */
  @Get()
  @Auth()
  public async me(@Req() request): Promise<User> {
    const user = request.user as User;
    return {
      ...user,
      password: undefined,
    };
  }

  /**
   * Authenticates a user and generates an access token.
   * @param body - The login user data.
   * @returns An object containing the access token.
   */
  @Post()
  public async login(
    @Body(new ValidationPipe()) body: LoginUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.authService.login(body.username, body.password);

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Registers a new user and generates an access token.
   * @param body - The user registration data.
   * @returns An object containing the access token.
   */
  @Post('register')
  public async register(
    @Body(new ValidationPipe()) body: CreateUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.authService.register(body);

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
