import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateRoomDto } from '../../controllers/quiz-session/create-room.dto';
import { Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { RoomData, RoomStatus } from './room-data';
import { HashService } from 'src/modules/shared/services/hash/hash.service';
import {
  ChatMessageEvent,
  ROOM_BEGIN_COUNTDOWN,
  UserInfo,
  WsEventType,
} from '../../constants';
import { SessionData } from 'express-session';
import {
  RoomEndedExceptions,
  RoomFullExceptions,
  RoomInvalidPassword,
  RoomRequirePasswords,
  RoomStartedExceptions,
} from './exceptions';
import { RoomId, UserId } from 'src/types/opaque';
import { UserData } from './user-data';
import { UserService } from 'src/modules/user/services/user/user.service';
import { Quiz } from '@prisma/client';
import { QuizQuestionService } from 'src/modules/shared/services/quiz/quiz-question.service';
import { Countdown } from './countdown';

@Injectable()
export class SocketSessionService {
  // List of users in a Room
  private roomUsers = new Map<RoomId, Map<UserId, UserData>>();
  // Data related to a room
  private roomData = new Map<RoomId, RoomData>();
  // Map rooms by usersId
  private usersRooms = new Map<UserId, RoomId>();

  public constructor(
    private eventEmitter: EventEmitter2,
    private hashService: HashService,
    private userService: UserService,
    private quizQuestionService: QuizQuestionService,
  ) {}

  /**
   * Create a new room with the given settings. This will store the room state in memory.   * @returns
   */
  public async createRoom(
    quiz: Quiz,
    { sessionPassword, userCountLimit, randomizeQuestions }: CreateRoomDto,
  ): Promise<string> {
    // Generate a random room ID
    const roomId = randomUUID() as RoomId;

    // Create the user list for the room
    const users = new Map();
    this.roomUsers.set(roomId, users);

    // Append the room data
    const data = new RoomData();
    data.quiz = quiz;

    // If a password is provided, hash it and store it
    if (sessionPassword.enable) {
      data.hashedPass = await this.hashService.hash(sessionPassword.password);
    }

    // If a user count limit is provided, store it
    if (userCountLimit.enable) {
      data.userLimit = userCountLimit.limit;
    }

    data.questions = await this.quizQuestionService.findQuestions(quiz);

    if (randomizeQuestions) {
      data.randomizeQuestions();
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
  public deleteRoom(roomId: RoomId) {
    for (const [userId] of this.roomUsers.get(roomId)) {
      this.usersRooms.delete(userId);
    }
    this.roomUsers.delete(roomId);
    const data = this.roomData.get(roomId);
    data.countDown?.stop();
    this.roomData.delete(roomId);
  }

  /**
   * Check if a room exists by its ID.
   * @param roomId - The ID of the room to check.
   * @returns True if the room exists, false otherwise.
   */
  public hasRoom(roomId: RoomId) {
    return this.roomUsers.has(roomId) && this.roomData.has(roomId);
  }

  /**
   * Make a user join a room by its ID.
   * @param roomId - The ID of the room to join.
   * @param socket - The socket of the user.
   * @param password - The password provided by the user to join the room.
   * @returns The room data if the user joined successfully, undefined otherwise.
   */
  public async joinRoom(roomId: RoomId, socket: Socket, password?: string) {
    // If the room does not exist, return
    if (!this.hasRoom(roomId)) {
      throw new NotFoundException('Room not found');
    }

    // Get the room's user list and data
    const users = this.roomUsers.get(roomId);
    const data = this.roomData.get(roomId);
    const userId = this.getUserId(socket);
    const ownerId = data.quiz.userId;

    if (ownerId !== userId) {
      // If there is a password on the room, but the user did not provide one, return
      if (data.hashedPass && !password) {
        throw new RoomRequirePasswords();
      }

      // If there is a password on the room and the user provided one, but it is incorrect, return
      if (!(await this.hashService.verify(password, data.hashedPass))) {
        throw new RoomInvalidPassword();
      }

      // If there is a user limit on the room and the limit is reached, return
      if (data.userLimit && users.size >= data.userLimit) {
        throw new RoomFullExceptions();
      }
    }

    // If the room is already started, return
    if (data.status === RoomStatus.STARTED) {
      throw new RoomStartedExceptions();
    }

    const user = await this.userService.find(userId);
    // If the user is already in the room, close the previous connection
    if (users.has(userId) && users.get(userId).socket.id !== socket.id) {
      users.get(userId).socket.disconnect();
    }

    // Join the room
    socket.join(roomId);
    // Then set the new one
    users.set(userId, new UserData(socket, roomId, user, this.eventEmitter));
    this.usersRooms.set(userId, roomId);

    // Emit the room information
    socket.emit(WsEventType.ROOM_INFO, { quiz: data.quiz });

    const usersInRoom = this.getUsersInRoom(roomId);
    // Emit the user joined event
    this.eventEmitter.emit(WsEventType.USER_JOINED, roomId, user, usersInRoom);
  }

  /**
   * Make a user leave a room by its ID.
   * @param roomId - The ID of the room to leave.
   * @param socket - The socket of the user.
   */
  public async leaveRoom(socket: Socket) {
    const roomId = this.usersRooms.get(this.getUserId(socket));
    // If the user isn't in the room
    if (!this.roomUsers.has(roomId)) {
      throw new NotFoundException('Room not found');
    }

    // Get the room's user list
    const users = this.roomUsers.get(roomId);

    const userId = this.getUserId(socket);
    const user = await this.userService.find(userId);
    // If the user is in the room
    if (users.has(userId)) {
      // Remove the user from the room
      users.delete(userId);
      this.usersRooms.delete(userId);

      const usersInRoom = this.getUsersInRoom(roomId);
      // Emit the user left event
      this.eventEmitter.emit(WsEventType.USER_LEFT, roomId, user, usersInRoom);
    }

    // If the room is empty, delete it
    if (users.size === 0) {
      this.deleteRoom(roomId);
    }

    // And close the connection
    socket.disconnect();
  }

  public compose(client: Socket) {
    const userId = this.getUserId(client);
    if (!this.usersRooms.has(userId)) {
      return;
    }

    const roomId = this.usersRooms.get(userId);
    const roomUsers = this.roomUsers.get(roomId);
    if (!roomUsers) {
      throw new NotFoundException();
    }
    const userData = roomUsers.get(userId);

    userData.type();
  }

  public stopComposing(client: Socket) {
    const userId = this.getUserId(client);
    if (!this.usersRooms.has(userId)) {
      return;
    }

    const roomId = this.usersRooms.get(userId);
    if (!this.roomUsers.has(roomId)) {
      return;
    }
    const roomUsers = this.roomUsers.get(roomId);
    const socket = roomUsers.get(userId);

    socket.stopTyping();
  }

  private getUserId(client: Socket): UserId {
    return (client.request['session'] as SessionData).userId;
  }

  public getComposingUsers(roomId: RoomId): UserInfo[] {
    const users = this.roomUsers.get(roomId);
    return Array.from(users.values())
      .filter((user) => user.isComposing)
      .map((user) => user.toJSON());
  }

  public getUsersInRoom(roomId: RoomId): UserInfo[] {
    const users = this.roomUsers.get(roomId);
    return Array.from(users.values()).map((user) => user.toJSON());
  }

  public async sendChatMessage(client: Socket, data: ChatMessageEvent) {
    const userId = this.getUserId(client);
    if (!this.usersRooms.has(userId)) {
      return;
    }

    const roomId = this.usersRooms.get(userId);
    const roomUsers = this.roomUsers.get(roomId);
    if (!roomUsers) {
      throw new NotFoundException();
    }

    const user = await this.userService.find(userId);

    this.eventEmitter.emit(WsEventType.CHAT_MESSAGE, roomId, {
      event: data.event,
      message: data.message,
      timestamp: Date.now(),
      user: {
        id: user.id,
        username: user.username,
      },
    } satisfies ChatMessageEvent);
  }

  public async endSession(client: Socket) {
    const userId = this.getUserId(client);
    if (!this.usersRooms.has(userId)) {
      return;
    }

    const roomId = this.usersRooms.get(userId);
    const roomData = this.roomData.get(roomId);
    if (!roomData) {
      throw new NotFoundException();
    }

    if (roomData.quiz.userId !== userId) {
      throw new UnauthorizedException();
    }

    this.eventEmitter.emit(WsEventType.SESSION_ENDED, roomId);
  }

  public async startSession(client: Socket) {
    const userId = this.getUserId(client);
    if (!this.usersRooms.has(userId)) {
      return;
    }

    const roomId = this.usersRooms.get(userId);
    const roomData = this.roomData.get(roomId);
    if (!roomData) {
      throw new NotFoundException();
    }

    if (roomData.quiz.userId !== userId) {
      throw new UnauthorizedException();
    }

    if (roomData.status === RoomStatus.STARTED) {
      throw new RoomStartedExceptions();
    }

    if (roomData.status === RoomStatus.ENDED) {
      throw new RoomEndedExceptions();
    }

    roomData.status = RoomStatus.STARTED;
    roomData.countDown = new Countdown(ROOM_BEGIN_COUNTDOWN, (count) => {
      if (count > 0) {
        this.eventEmitter.emit(WsEventType.START_COUNTDOWN, roomId, count);
      } else {
        this.eventEmitter.emit(WsEventType.START_SESSION, roomId);
      }
    });
    roomData.countDown.start();
  }
}
