import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from 'src/modules/user/decorators/auth.decorator';
import { SocketSessionService } from '../../services/socket-session/socket-session.service';
import { CreateRoomDto } from './create-room.dto';
import { QuizId } from 'src/types/opaque';
import { QuizService } from 'src/modules/shared/services/quiz/quiz.service';

@Controller('quizzes')
@Auth()
export class QuizSessionController {
  constructor(
    private socketSession: SocketSessionService,
    private quizService: QuizService,
  ) {}

  @Post(':id/play')
  public async playSessions(
    @Param('id') id: QuizId,
    @Body(new ValidationPipe()) body: CreateRoomDto,
  ) {
    const quiz = await this.quizService.find(id);
    const roomId = await this.socketSession.createRoom(quiz, body);

    return {
      roomId,
    };
  }

  @Post('search')
  public async searchSessions(@Query('search') search: string) {
    const rooms = this.socketSession.searchRooms(search);

    return {
      rooms,
    };
  }
}
