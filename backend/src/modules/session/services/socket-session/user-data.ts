import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { UserInfo, WsEventType } from '../../constants';
import { RoomId, UserId } from 'src/types/opaque';

export const TIME_TO_COMPOSE = 5000;

export class UserData {
  public isComposing: boolean;
  public points: number = 0;

  private composingTimeout: NodeJS.Timeout;

  public constructor(
    public socket: Socket,
    public roomId: RoomId,
    public user: User,
    private eventEmitter: EventEmitter2,
  ) {
    this.isComposing = false;
  }

  public type(): void {
    if (!this.isComposing) {
      this.isComposing = true;
      this.eventEmitter.emit(WsEventType.IS_COMPOSING, this);
    }

    clearTimeout(this.composingTimeout);
    this.composingTimeout = setTimeout(() => {
      this.isComposing = false;
      if (this.eventEmitter) {
        this.eventEmitter.emit(WsEventType.COMPOSING_END, this);
      }
    }, TIME_TO_COMPOSE);
  }

  public stopTyping(): void {
    this.isComposing = false;
    clearTimeout(this.composingTimeout);
    this.eventEmitter.emit(WsEventType.COMPOSING_END, this);
  }

  public toJSON(): UserInfo {
    return {
      id: this.user.id as UserId,
      username: this.user.username,
      points: this.points,
    };
  }
}
