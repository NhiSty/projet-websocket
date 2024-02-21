import { Module } from '@nestjs/common';
import { QuizSessionController } from './controllers/quiz-session/quiz-session.controller';

@Module({
  controllers: [QuizSessionController],
})
export class GatewayModule {}
