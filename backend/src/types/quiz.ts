import { Answer, Question, Quiz, User } from '@prisma/client';

export type QuestionWithAnswer = Question & {
  answers: Answer[];
};

export type QuizWithAuthor = Quiz & {
  author: Pick<User, 'id' | 'username'>;
  questions: QuestionWithAnswer[];
};
