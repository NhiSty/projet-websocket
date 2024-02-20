import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { QuizQuestionService } from 'src/services/quiz/quiz-question.service';
import { QuizService } from 'src/services/quiz/quiz.service';
import { CreateQuestionDto } from './create-question-dto';
import { UpdateQuestionDto } from './update-question-dto';

@Controller('admins/quizzes/:quizId/questions')
@Auth()
@Roles([Role.ADMIN, Role.SUPERADMIN])
export class QuizQuestionsController {
  public constructor(
    private quizQuestionService: QuizQuestionService,
    private quizService: QuizService,
  ) {}

  @Get()
  public async fetchQuizQuestions(@Param('quizId') id: string) {
    const quiz = await this.quizService.find(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.quizQuestionService.findQuestions(quiz);
  }

  @Post()
  public async createQuestion(
    @Param('quizId') id: string,
    @Body() body: CreateQuestionDto,
  ) {
    const quiz = await this.quizService.find(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.quizQuestionService.addQuestion(
      quiz,
      body.name,
      body.type,
      body.duration,
      body.choices?.map((choice) => ({
        choice: choice.choice,
        correct: choice.correct,
      })),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  public async deleteQuestion(
    @Param('quizId') quizId: string,
    @Param('id') id: string,
  ) {
    const question = await this.quizQuestionService.find(id);
    if (!question) {
      throw new NotFoundException('Quiz not found');
    }

    await this.quizQuestionService.deleteQuestion(question);
    return;
  }

  @Patch(':id/move')
  @HttpCode(204)
  public async moveQuestion(
    @Param('quizId') quizId: string,
    @Param('id') id: string,
    @Query('direction') direction: 'up' | 'down',
  ) {
    if (direction !== 'up' && direction !== 'down') {
      throw new UnprocessableEntityException('Invalid direction');
    }

    const question = await this.quizQuestionService.find(id);
    if (!question) {
      throw new NotFoundException('Quiz not found');
    }

    return this.quizQuestionService.moveQuestion(question, direction);
  }

  @Patch(':id')
  @HttpCode(204)
  public async updateQuestion(
    @Param('quizId') quizId: string,
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
  ) {
    const question = await this.quizQuestionService.find(id);
    if (!question) {
      throw new NotFoundException('Quiz not found');
    }

    return this.quizQuestionService.updateQuestion(
      {
        ...question,
        question: body.name,
        type: body.type,
        duration: body.duration,
      },
      body.choices.map((choice) => ({
        id: choice.id,
        choice: choice.choice,
        correct: choice.correct,
      })),
    );
  }
}
