import { Module } from '@nestjs/common';
import { QuizSessionController } from './controllers/quiz-session/quiz-session.controller';
import { SocketSessionService } from './services/socket-session/socket-session.service';
import { MessageGateway } from './gateway/message/message.gateway';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    SharedModule,
    UserModule,
    ConfigModule,
  ],
  controllers: [QuizSessionController],
  providers: [SocketSessionService, MessageGateway],
})
export class SessionModule {}
