import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateRoomDto } from '../../controllers/quiz-session/create-room.dto';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { RoomData } from './room-data';
import { HashService } from 'src/modules/shared/services/hash/hash.service';
import { WsEventType } from '../../constants';
import { SessionData } from 'express-session';
import {
  RoomFullExceptions,
  RoomRequirePasswords,
  RoomStartedExceptions,
} from './exceptions';

type RoomId = string;
type UserId = string;

@Injectable()
export class SocketSessionService {
  private server: Server;

  // List of users in a Room
  private roomUsers = new Map<RoomId, Map<UserId, Socket>>();
  // Data related to a room
  private roomData = new Map<RoomId, RoomData>();

  public constructor(
    private eventEmitter: EventEmitter2,
    private hashService: HashService,
  ) {}

  /**
   * Create a new room with the given settings. This will store the room state in memory.   * @returns
   */
  public async createRoom({
    sessionPassword,
    userCountLimit,
  }: CreateRoomDto): Promise<string> {
    // Generate a random room ID
    const roomId = randomUUID();

    // Create the user list for the room
    const users = new Map();
    this.roomUsers.set(roomId, users);

    // Append the room data
    const data = new RoomData();

    // If a password is provided, hash it and store it
    if (sessionPassword.enable) {
      data.hashedPass = await this.hashService.hash(sessionPassword.password);
    }

    // If a user count limit is provided, store it
    if (userCountLimit.enable) {
      data.userLimit = userCountLimit.limit;
    }

    // Store the room data
    this.roomData.set(roomId, data);

    // And return the room ID
    return roomId;
  }

  /**
   * Delete a room by its ID.
   * @param roomId - The ID of the room to delete.
   */
  public deleteRoom(roomId: string) {
    this.roomUsers.delete(roomId);
    this.roomData.delete(roomId);
  }

  /**
   * Check if a room exists by its ID.
   * @param roomId - The ID of the room to check.
   * @returns True if the room exists, false otherwise.
   */
  public hasRoom(roomId: string) {
    return this.roomUsers.has(roomId) && this.roomData.has(roomId);
  }

  /**
   * Make a user join a room by its ID.
   * @param roomId - The ID of the room to join.
   * @param socket - The socket of the user.
   * @param password - The password provided by the user to join the room.
   * @returns The room data if the user joined successfully, undefined otherwise.
   */
  public joinRoom(roomId: string, socket: Socket, password?: string) {
    // If the room does not exist, return
    if (!this.hasRoom(roomId)) {
      throw new NotFoundException('Room not found');
    }

    // Get the room's user list and data
    const users = this.roomUsers.get(roomId);
    const data = this.roomData.get(roomId);

    // If there is a password on the room, but the user did not provide one, return
    if (data.hashedPass && !password) {
      throw new RoomRequirePasswords();
    }

    // If there is a password on the room and the user provided one, but it is incorrect, return
    if (data.hashedPass && password) {
      if (!this.hashService.verify(password, data.hashedPass)) {
        throw new UnauthorizedException('Password incorrect');
      }
    }

    // If there is a user limit on the room and the limit is reached, return
    if (data.userLimit && users.size >= data.userLimit) {
      throw new RoomFullExceptions();
    }

    // If the room is already started, return
    if (data.started) {
      throw new RoomStartedExceptions();
    }

    const userId = (socket.request['session'] as SessionData).userId;
    // If the user is already in the room, close the previous connection
    if (users.has(userId) && users.get(userId).id !== socket.id) {
      users.get(userId).disconnect();
    }

    // Then set the new one
    users.set(userId, socket);

    // Emit the user joined event
    this.eventEmitter.emit(WsEventType.USER_JOINED, roomId, userId);
  }

  /**
   * Make a user leave a room by its ID.
   * @param roomId - The ID of the room to leave.
   * @param socket - The socket of the user.
   */
  public leaveRoom(roomId: string, socket: Socket) {
    // If the user isn't in the room
    if (!this.roomUsers.has(roomId)) {
      throw new NotFoundException('Room not found');
    }

    // Get the room's user list
    const users = this.roomUsers.get(roomId);

    // If the user is in the room
    if (users.has(socket.id)) {
      // Remove the user from the room
      users.delete(socket.id);

      // Emit the user left event
      this.eventEmitter.emit(WsEventType.USER_LEFT, roomId, socket.id);
    }

    // If the room is empty, delete it
    if (users.size === 0) {
      this.deleteRoom(roomId);
    }

    // And close the connection
    socket.disconnect();
  }
}
