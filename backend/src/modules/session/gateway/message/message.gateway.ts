import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import {
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketSessionService } from '../../services/socket-session/socket-session.service';
import { JoinRoomEvent, WsErrorType, WsEventType } from '../../constants';
import { sessionMiddleware } from 'src/session';
import { ConfigService } from '@nestjs/config';
import { AuthWsGuard } from '../../guards/auth-ws/auth-ws.guard';
import {
  RoomFullExceptions,
  RoomInvalidPassword,
  RoomRequirePasswords,
  RoomStartedExceptions,
} from '../../services/socket-session/exceptions';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { UserData } from '../../services/socket-session/user-data';
import { RoomId } from 'src/types/opaque';

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

  public handleDisconnect(client: Socket) {
    try {
      this.socketSession.leaveRoom(client);
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
    this.socketSession.compose(client);
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
  public handleOnUserJoined(roomId: RoomId, user: User) {
    this.server.of(roomId).emit(WsEventType.USER_JOINED, { user });
  }
}
