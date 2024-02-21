import { Controller, Param, Post } from '@nestjs/common';
import { Auth } from 'src/modules/user/decorators/auth.decorator';

@Controller('quizzes/:id')
@Auth()
export class QuizSessionController {
  @Post('/play')
  public async playSessions(@Param('id') id: string) {}
}
