import { Module } from '@nestjs/common';
import { SuperadminController } from './controllers/superadmin/superadmin.controller';
import { QuizQuestionsController } from './controllers/quiz-questions/quiz-questions.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [SuperadminController, QuizController, QuizQuestionsController],
})
export class AdminModule {}
