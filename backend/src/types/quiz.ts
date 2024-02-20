import { Choices, Question, Quiz, User } from '@prisma/client';

export type QuestionWithChoices = Question & {
  choices: Choices[];
};

export type QuizWithData = Quiz & {
  author: Pick<User, 'id' | 'username'>;
  questions: QuestionWithChoices[];
};
