import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { QuizService } from 'src/services/quiz/quiz.service';
import { CreateQuizDto } from './create-quiz.dto';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('quizzes')
@Auth()
@Roles([Role.ADMIN, Role.SUPERADMIN])
export class QuizController {
  public constructor(private readonly quizService: QuizService) {}
  @Get()
  @Roles([Role.ADMIN, Role.SUPERADMIN])
  public async getQuizzes(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
  ) {
    if (search.length === 0) {
      search = undefined;
    }

    return this.quizService.findMany(page, search);
  }

  @Post()
  public async createQuiz(
    @Body() data: CreateQuizDto,
    @Req() request: Request,
  ) {
    const author = request.user!;
    const quiz = await this.quizService.create(data.name, author);

    return {
      id: quiz.id,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  public async deleteQuiz(@Param('id') id: string, @Req() request: Request) {
    const quiz = await this.quizService.find(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const currentUserRole = request.user.role;

    if (currentUserRole === Role.ADMIN && quiz.author.id !== request.user.id) {
      throw new ForbiddenException('You cannot delete this quiz');
    }

    await this.quizService.delete(quiz);
  }
}
