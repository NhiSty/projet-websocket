import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { QuizQuestionService } from 'src/services/quiz/quiz-question.service';
import { QuizService } from 'src/services/quiz/quiz.service';

@Controller('admins/quizzes/:id/questions')
@Auth()
@Roles([Role.ADMIN, Role.SUPERADMIN])
export class QuizQuestionsController {
  public constructor(
    private quizQuestionService: QuizQuestionService,
    private quizService: QuizService,
  ) {}

  @Get()
  public async fetchQuizQuestions(@Param('id') id: string) {
    const quiz = await this.quizService.find(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.quizQuestionService.findQuestions(quiz);
  }
}
