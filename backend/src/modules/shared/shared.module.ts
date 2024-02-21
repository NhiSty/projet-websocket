import { Module } from '@nestjs/common';
import { DatabaseService } from './services/database/database.service';
import { HashService } from './services/hash/hash.service';
import { QuizService } from './services/quiz/quiz.service';
import { QuizQuestionService } from './services/quiz/quiz-question.service';

@Module({
  providers: [DatabaseService, HashService, QuizService, QuizQuestionService],
  exports: [DatabaseService, HashService, QuizService, QuizQuestionService],
})
export class SharedModule {}
