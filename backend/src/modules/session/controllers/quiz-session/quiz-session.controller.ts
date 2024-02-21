import { Body, Controller, Param, Post, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/modules/user/decorators/auth.decorator';
import { SocketSessionService } from '../../services/socket-session/socket-session.service';
import { CreateRoomDto } from './create-room.dto';

@Controller('quizzes/:id')
@Auth()
export class QuizSessionController {
  constructor(private socketSession: SocketSessionService) {}

  @Post('play')
  public async playSessions(
    @Param('id') id: QuizId,
    @Body(new ValidationPipe()) body: CreateRoomDto,
  ) {
    const roomId = await this.socketSession.createRoom(body);

    return {
      roomId,
    };
  }
}
