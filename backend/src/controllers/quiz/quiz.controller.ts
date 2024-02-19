import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { QuizService } from 'src/services/quiz/quiz.service';
import { CreateQuizDto } from './create-quiz.dto';
import { Request, Response } from 'express';

@Controller('quizzes')
@Auth()
export class QuizController {
  public constructor(private readonly quizService: QuizService) {}
  @Get()
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
    @Res() response: Response,
  ) {
    const author = request.user!;
    await this.quizService.create(data.name, author);

    return response.status(201).send();
  }
}