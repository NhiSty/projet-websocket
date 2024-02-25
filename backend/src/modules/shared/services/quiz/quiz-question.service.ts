import { Injectable } from '@nestjs/common';
import { Choices, Question, QuestionType, Quiz } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { QuestionWithChoices, QuizWithData } from 'src/types/quiz';

@Injectable()
export class QuizQuestionService {
  public constructor(private databaseService: DatabaseService) {}

  public addQuestion(
    quiz: QuizWithData,
    question: string,
    type: QuestionType,
    duration: number,
    choices: Pick<Choices, 'choice' | 'correct'>[],
  ): Promise<Question> {
    const lastPos = quiz.questions.length;

    return this.databaseService.question.create({
      data: {
        question,
        type,
        duration,
        quizId: quiz.id,
        position: lastPos,
        choices: choices && {
          createMany: {
            data: choices,
          },
        },
      },
    });
  }

  public async findQuestions(quiz: Quiz): Promise<QuestionWithChoices[]> {
    return this.databaseService.question.findMany({
      where: { quizId: quiz.id },
      include: {
        choices: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  public async find(id: string): Promise<Question> {
    return this.databaseService.question.findUnique({
      where: { id },
    });
  }

  public async deleteQuestion(question: Question): Promise<void> {
    this.databaseService.$transaction([
      this.databaseService.question.delete({
        where: { id: question.id },
      }),
      // Update the position of the questions
      this.databaseService.question.updateMany({
        where: {
          quizId: question.quizId,
          position: {
            gt: question.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      }),
    ]);
  }

  public async updateQuestion(
    question: Question,
    choices?: Pick<Choices, 'choice' | 'correct' | 'id'>[],
  ): Promise<Question> {
    return this.databaseService.question.update({
      where: { id: question.id },
      data: {
        ...question,
        choices: {
          upsert: choices?.map((choice) => ({
            where: { id: choice.id },
            create: choice,
            update: choice,
          })),
        },
      },
    });
  }

  public async moveQuestion(
    question: Question,
    direction: 'up' | 'down',
  ): Promise<Question> {
    // Fetch all the questions for the parent quiz
    const questions = await this.databaseService.question.findMany({
      where: { quizId: question.quizId },
      orderBy: { position: 'asc' },
    });

    // Now get the current question index
    const index = questions.findIndex((q) => q.id === question.id);
    // Then the index of the question to swap with
    const otherIndex = direction === 'up' ? index - 1 : index + 1;

    // Obviously, we prevent the question to go out of bound
    if (index === -1 || otherIndex < 0 || otherIndex >= questions.length) {
      return question;
    }

    const otherQuestion = questions[otherIndex];

    await this.databaseService.$transaction([
      // First, we update the position of the question to a temporary (dumb) value
      // This is to prevent a unique constraint error
      this.databaseService.question.update({
        where: { id: question.id },
        data: { position: -1 },
      }),
      // Then we update the position of the other question to the position of the current question
      this.databaseService.question.update({
        where: { id: otherQuestion.id },
        data: { position: question.position },
      }),
      // Finally, we update the position of the current question to the position of the other question
      this.databaseService.question.update({
        where: { id: question.id },
        data: { position: otherQuestion.position },
      }),
    ]);

    return this.find(question.id);
  }
}
