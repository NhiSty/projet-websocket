import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketSessionService } from '../../services/socket-session/socket-session.service';

@WebSocketGateway()
@Injectable()
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  public constructor(private socketSession: SocketSessionService) {}

  public handleConnection(client: any, ...args: any[]) {
    throw new Error('Method not implemented.');
  }

  public handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
  }
}
