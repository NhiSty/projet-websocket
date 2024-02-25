import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketSessionService } from '../../services/socket-session/socket-session.service';
import {
  ChatMessageEvent,
  JoinRoomEvent,
  QuestionAddTimeEvent,
  UserInfo,
  UserResponseEvent,
  WsErrorType,
  WsEventType,
} from '../../constants';
import { sessionMiddleware } from 'src/session';
import { ConfigService } from '@nestjs/config';
import { AuthWsGuard } from '../../guards/auth-ws/auth-ws.guard';
import {
  RoomEndedExceptions,
  RoomFullExceptions,
  RoomInvalidPassword,
  RoomRequirePasswords,
  RoomStartedExceptions,
} from '../../services/socket-session/exceptions';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { UserData } from '../../services/socket-session/user-data';
import { RoomId } from 'src/types/opaque';
import { QuestionWithChoices } from 'src/types/quiz';

@WebSocketGateway()
@Injectable()
export class MessageGateway
  implements OnGatewayDisconnect<Socket>, OnGatewayInit<Socket>
{
  @WebSocketServer()
  private server: Server;

  public constructor(
    private socketSession: SocketSessionService,
    private configService: ConfigService,
  ) {}

  public afterInit() {
    this.server.engine.use(sessionMiddleware(this.configService));
  }

  public async handleDisconnect(client: Socket) {
    try {
      await this.socketSession.leaveRoom(client);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND, { message: error.message });
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  @SubscribeMessage(WsEventType.JOIN_ROOM)
  @UseGuards(AuthWsGuard)
  public async handleJoinRoom(client: Socket, data: JoinRoomEvent) {
    try {
      await this.socketSession.joinRoom(data.roomId, client, data.password);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND, { message: error.message });
        return;
      }

      if (error instanceof RoomFullExceptions) {
        client.emit(WsErrorType.ROOM_FULL);
        return;
      }

      if (error instanceof RoomStartedExceptions) {
        client.emit(WsErrorType.ALREADY_STARTED);
        return;
      }

      if (error instanceof RoomRequirePasswords) {
        client.emit(WsErrorType.REQUIRE_PASSWORD);
        return;
      }

      if (error instanceof RoomInvalidPassword) {
        client.emit(WsErrorType.INVALID_PASSWORD);
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  // When a "composing" event is received, it set the state on the userData object
  @SubscribeMessage(WsEventType.IS_COMPOSING)
  @UseGuards(AuthWsGuard)
  public async handleComposing(client: Socket) {
    try {
      this.socketSession.compose(client);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  // When "composing end" event is received, it set the state on the userData object
  @SubscribeMessage(WsEventType.COMPOSING_END)
  @UseGuards(AuthWsGuard)
  public async handleComposingEnd(client: Socket) {
    this.socketSession.stopComposing(client);
  }

  // When an event is sent by a userData object, broadcast the data to other clients
  @OnEvent(WsEventType.IS_COMPOSING)
  @OnEvent(WsEventType.COMPOSING_END)
  public handleIsComposing(data: UserData) {
    const composingUsers = this.socketSession.getComposingUsers(data.roomId);

    this.server.to(data.roomId).emit(WsEventType.IS_COMPOSING, {
      users: composingUsers,
    });
  }

  @OnEvent(WsEventType.USER_JOINED)
  public handleOnUserJoined(roomId: RoomId, user: User, users: UserInfo[]) {
    this.server.to(roomId).emit(WsEventType.USER_JOINED, { user, users });
  }

  @OnEvent(WsEventType.USER_LEFT)
  public handleOnUserLeft(roomId: RoomId, user: User, users: UserInfo[]) {
    this.server.to(roomId).emit(WsEventType.USER_LEFT, { user, users });
  }

  // When a user send a message to a room
  @SubscribeMessage(WsEventType.CHAT_MESSAGE)
  @UseGuards(AuthWsGuard)
  public async handleMessage(client: Socket, data: ChatMessageEvent) {
    try {
      await this.socketSession.sendChatMessage(client, data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  // When a message need to be broadcasted to other users
  @OnEvent(WsEventType.CHAT_MESSAGE)
  public handleMessageBroadcast(roomId: RoomId, message: ChatMessageEvent) {
    this.server.to(roomId).emit(WsEventType.CHAT_MESSAGE, message);
  }

  @SubscribeMessage(WsEventType.END_SESSION)
  @UseGuards(AuthWsGuard)
  public async handleEndSession(client: Socket) {
    try {
      await this.socketSession.endSession(client);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  @OnEvent(WsEventType.SESSION_ENDED)
  public handleSessionEnded(roomId: RoomId) {
    this.server.to(roomId).emit(WsEventType.SESSION_ENDED);
  }

  @SubscribeMessage(WsEventType.START_SESSION)
  @UseGuards(AuthWsGuard)
  public async handleStartSession(client: Socket) {
    try {
      console.log('Start session');
      await this.socketSession.startSession(client);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      if (error instanceof RoomStartedExceptions) {
        client.emit(WsErrorType.ALREADY_STARTED);
        return;
      }

      if (error instanceof RoomEndedExceptions) {
        client.emit(WsErrorType.ALREADY_FINISHED);
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  @OnEvent(WsEventType.START_COUNTDOWN)
  public handleOnStartCountdown(roomId: RoomId, count: number): void {
    this.server.to(roomId).emit(WsEventType.START_COUNTDOWN, count);
  }

  @OnEvent(WsEventType.START_SESSION)
  public handleOnStartSession(roomId: RoomId) {
    this.server.to(roomId).emit(WsEventType.START_SESSION);

    this.socketSession.sendQuestionsList(roomId);
  }

  @OnEvent(WsEventType.QUESTION_COUNTDOWN)
  @OnEvent(WsEventType.INTER_QUESTION_COUNTDOWN)
  public handleOnQuestionCountdown(roomId: RoomId, count: number): void {
    this.server.to(roomId).emit(WsEventType.QUESTION_COUNTDOWN, count);
  }

  @OnEvent(WsEventType.QUESTION_COUNTDOWN_END)
  @OnEvent(WsEventType.INTER_QUESTION_COUNTDOWN_END)
  public handleOnQuestionCountdownEnd(roomId: RoomId): void {
    this.server.to(roomId).emit(WsEventType.QUESTION_COUNTDOWN_END);
  }

  @OnEvent(WsEventType.QUESTION)
  public handleOnQuestion(roomId: RoomId, question: QuestionWithChoices): void {
    this.server.to(roomId).emit(WsEventType.QUESTION, question);
  }

  @OnEvent(WsEventType.FINISHED_QUESTIONS)
  public handleOnQuestionFinished(roomId: RoomId): void {
    this.server.to(roomId).emit(WsEventType.FINISHED_QUESTIONS);
  }

  @SubscribeMessage(WsEventType.USER_RESPONSE)
  @UseGuards(AuthWsGuard)
  public async handleUserResponse(client: Socket, data: UserResponseEvent) {
    try {
      await this.socketSession.saveUserResponse(client, data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      if (error instanceof UnauthorizedException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  @OnEvent(WsEventType.USER_RESPONSE)
  public handleOnUserResponse(roomId: RoomId) {
    this.socketSession.sendResponsePercentage(roomId);
  }

  @OnEvent(WsEventType.USER_POINTS)
  public handleOnUserPoints(roomId: RoomId, users: UserInfo[]) {
    this.server.to(roomId).emit(WsEventType.USER_POINTS, { users });
  }

  @SubscribeMessage(WsEventType.QUESTION_ADD_TIME)
  @UseGuards(AuthWsGuard)
  public async handleAddTime(client: Socket, data: QuestionAddTimeEvent) {
    try {
      this.socketSession.addTime(client, data.time);
    } catch (error) {
      if (error instanceof NotFoundException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      if (error instanceof UnauthorizedException) {
        client.emit(WsErrorType.ROOM_NOT_FOUND);
        return;
      }

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Unexpected error';
        console.error(message);
      }
      client.emit(WsErrorType.UNKNOWN_ERROR, { message });
    }
  }

  @OnEvent(WsEventType.QUESTION_ADD_TIME)
  public handleOnAddTime(roomId: RoomId, seconds: number) {
    this.server
      .to(roomId)
      .emit(WsEventType.QUESTION_ADD_TIME, { time: seconds });
  }
}
