import { Choices, Question, Quiz, User } from '@prisma/client';
import { AnswerId } from './opaque';

export type QuestionWithChoices = Question & {
  choices: Choices[];
};

export type QuizWithData = Quiz & {
  author: Pick<User, 'id' | 'username'>;
  questions: QuestionWithChoices[];
};

export type RoomResponsesPercentage = {
  total: number;
} & Record<AnswerId, number>;
