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
import { Auth } from 'src/modules/user/decorators/auth.decorator';
import { SessionData } from 'express-session';
import { AuthWsGuard } from '../../guards/auth-ws/auth-ws.guard';
import {
  RoomFullExceptions,
  RoomInvalidPassword,
  RoomRequirePasswords,
  RoomStartedExceptions,
} from '../../services/socket-session/exceptions';
import { OnEvent } from '@nestjs/event-emitter';
import { UserService } from 'src/modules/user/services/user/user.service';

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
    private userService: UserService,
  ) {}

  public afterInit() {
    this.server.engine.use(sessionMiddleware(this.configService));
  }

  public handleDisconnect() {
    console.log('Client disconnected');
  }

  @SubscribeMessage(WsEventType.JOIN_ROOM)
  @UseGuards(AuthWsGuard)
  @Auth()
  public async handleJoinRoom(client: Socket, data: JoinRoomEvent) {
    console.log((<SessionData>client.request['session']).userId);
    console.log('Join room', data.roomId);
    try {
      this.socketSession.joinRoom(data.roomId, client, data.password);
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

  @OnEvent(WsEventType.USER_JOINED)
  public handleOnUserJoined(roomId: string, userId: string) {
    console.log(`User ${userId} joined`);
    const user = this.userService.find(userId);
    this.server.of(roomId).emit(WsEventType.USER_JOINED, { user });
  }
}