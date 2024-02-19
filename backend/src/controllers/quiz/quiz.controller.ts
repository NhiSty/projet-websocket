import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from 'src/decorators/auth.decorator';
import { QuizService } from 'src/services/quiz/quiz.service';

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
}