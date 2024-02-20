import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Question, QuestionType, Quiz } from '@prisma/client';

@Injectable()
export class QuizQuestionService {
  public constructor(private databaseService: DatabaseService) {}

  public addQuestion(
    quiz: Quiz,
    question: string,
    type: QuestionType,
    duration: number,
  ): Promise<Question> {
    return this.databaseService.question.create({
      data: { question, type, duration, quizId: quiz.id },
    });
  }

  public async findQuestions(quiz: Quiz): Promise<Question[]> {
    return this.databaseService.question.findMany({
      where: { quizId: quiz.id },
    });
  }

  public async find(id: string): Promise<Question> {
    return this.databaseService.question.findUnique({
      where: { id },
    });
  }

  public async deleteQuestion(question: Question): Promise<Question> {
    return this.databaseService.question.delete({
      where: {
        id: question.id,
      },
    });
  }

  public async updateQuestion(question: Question): Promise<Question> {
    return this.databaseService.question.update({
      where: { id: question.id },
      data: question,
    });
  }
}
