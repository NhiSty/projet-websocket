import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserService } from 'src/services/user/user.service';
import { AdminCreateUserDto } from './admin-create-user.dto';
import { Request, Response } from 'express';
import { AdminUpdateUserDto } from './admin-update-user.dto';

@Controller('admins/users')
@Auth()
@Roles([Role.SUPERADMIN, Role.ADMIN])
export class SuperadminController {
  public constructor(private readonly userService: UserService) {}

  @Get()
  public async getUsers(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
  ) {
    if (search.length === 0) {
      search = undefined;
    }
    return this.userService.findMany(page, search);
  }

  @Post()
  public async createUser(
    @Body(new ValidationPipe()) user: AdminCreateUserDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const foundUser = await this.userService.findByUsername(user.username);
    if (foundUser) {
      throw new ConflictException('Username already exists');
    }

    const currentUserRole = request.user!.role;

    if (currentUserRole === user.role) {
      throw new ForbiddenException(
        'You cannot create a user with the same role',
      );
    }

    if (currentUserRole === Role.ADMIN && user.role !== Role.USER) {
      throw new ForbiddenException('You cannot create an admin');
    }

    await this.userService.create(user.username, user.password, user.role);

    return response.sendStatus(204);
  }

  @Delete(':id')
  @HttpCode(204)
  public async deleteUser(@Param('id') id: string, @Req() request: Request) {
    if (request.user.id === id) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    const user = await this.userService.find(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentUserRole = request.user.role;

    if (currentUserRole === user.role) {
      throw new ForbiddenException(
        'You cannot delete a user with the same role',
      );
    }

    if (currentUserRole === Role.ADMIN && user.role !== Role.USER) {
      throw new ForbiddenException('You cannot delete an admin');
    }

    return this.userService.deleteUserFromId(user);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  public async updateUser(
    @Param('id') id: string,
    @Req() request: Request,
    @Body(new ValidationPipe()) body: AdminUpdateUserDto,
  ) {
    if (request.user.id === id) {
      throw new ForbiddenException('You cannot update yourself');
    }

    const user = await this.userService.find(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentUserRole = request.user.role;

    if (currentUserRole === user.role) {
      throw new ForbiddenException(
        'You cannot update a user with the same role',
      );
    }

    user.role = body.role;
    return this.userService.updateUser(user);
  }
}
