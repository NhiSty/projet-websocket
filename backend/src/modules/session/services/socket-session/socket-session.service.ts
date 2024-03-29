import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateRoomDto } from '../../controllers/quiz-session/create-room.dto';
import { Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { RoomData, RoomStatus } from './room-data';
import { HashService } from 'src/modules/shared/services/hash/hash.service';
import {
  ChatMessageEvent,
  ROOM_BEGIN_COUNTDOWN,
  UserInfo,
  UserResponseEvent,
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
import { QuizQuestionService } from 'src/modules/shared/services/quiz/quiz-question.service';
import { Countdown } from './countdown';
import { QuizWithData, RoomResponsesPercentage } from 'src/types/quiz';
import { JaroWinklerDistance } from 'natural';

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
    quiz: QuizWithData,
    { sessionPassword, userCountLimit, randomizeQuestions }: CreateRoomDto,
  ): Promise<string> {
    // Generate a random room ID
    const roomId = randomUUID() as RoomId;

    // Create the user list for the room
    const users = new Map();
    this.roomUsers.set(roomId, users);

    // Append the room data
    const data = new RoomData();
    data.id = roomId;
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
      // If there is a password to access the room
      if (data.hashedPass) {
        // If the user did not provide one, return
        if (!password) {
          throw new RoomRequirePasswords();
        }

        // If the user provided a password, but it is incorrect, return
        if (!(await this.hashService.verify(password, data.hashedPass))) {
          throw new RoomInvalidPassword();
        }
      }

      // Get the user count: total users - 1 owner
      const usersCount = users.size - 1;
      // If there is a user limit on the room and the limit is reached, return
      if (data.userLimit && usersCount >= data.userLimit) {
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
    const userData = new UserData(socket, roomId, user, this.eventEmitter);
    userData.points;
    // Then set the new one
    users.set(userId, userData);
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
    if (users.has(userId) && users.get(userId).socket.id === socket.id) {
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

    const user = roomUsers.get(userId);

    this.eventEmitter.emit(WsEventType.CHAT_MESSAGE, roomId, {
      event: data.event,
      message: data.message,
      timestamp: Date.now(),
      user: user.toJSON(),
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

    roomData.countDown?.stop();

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

  @OnEvent(WsEventType.START_SESSION, { nextTick: true })
  @OnEvent(WsEventType.NEXT_QUESTION, { nextTick: true })
  protected async onSessionStart(roomId: RoomId) {
    // When the session start, we send the first question and start the countdown
    const roomData = this.roomData.get(roomId);

    if (!roomData) {
      throw new NotFoundException();
    }

    if (roomData.questionIndex >= roomData.questions.length) {
      roomData.countDown?.stop();
      this.eventEmitter.emit(WsEventType.FINISHED_QUESTIONS, roomId);
      return;
    }

    const question = roomData.currentQuestion();
    this.eventEmitter.emit(WsEventType.QUESTION, roomId, question);
    roomData.countDown = new Countdown(question.duration, (count) => {
      if (count > 0) {
        this.eventEmitter.emit(WsEventType.QUESTION_COUNTDOWN, roomId, count);
      } else {
        this.eventEmitter.emit(WsEventType.QUESTION_COUNTDOWN_END, roomId);
      }
    });
    roomData.countDown.start();
  }

  @OnEvent(WsEventType.QUESTION_COUNTDOWN_END, { nextTick: true })
  public async onQuestionCountdownEnd(roomId: RoomId) {
    // When the question countdown ends, we send the next question
    const roomData = this.roomData.get(roomId);

    if (!roomData) {
      throw new NotFoundException();
    }

    // Send the response percentage to the users
    this.sendResponsePercentage(roomId);
    // Compute points for each user
    await this.computePoints(roomId);
    // Send the points to the users
    const usersInRoom = this.getUsersInRoom(roomId);
    this.eventEmitter.emit(WsEventType.USER_POINTS, roomId, usersInRoom);

    roomData.countDown.stop();
    roomData.countDown = new Countdown(5, (count) => {
      if (count > 0) {
        this.eventEmitter.emit(
          WsEventType.INTER_QUESTION_COUNTDOWN,
          roomId,
          count,
        );
      } else {
        this.eventEmitter.emit(
          WsEventType.INTER_QUESTION_COUNTDOWN_END,
          roomId,
        );
        roomData.nextQuestion();
        this.eventEmitter.emit(WsEventType.NEXT_QUESTION, roomId);
      }
    });
    roomData.countDown.start();
  }

  public sendQuestionsList(roomId: RoomId) {
    // Check if the room exists
    const roomData = this.roomData.get(roomId);

    if (!roomData) {
      throw new NotFoundException();
    }

    const userId = roomData.quiz.userId as UserId;
    const users = this.roomUsers.get(roomId);
    if (!users) {
      throw new NotFoundException();
    }
    const user = users.get(userId);
    if (!user) {
      throw new NotFoundException();
    }

    // Send the questions list to the user
    user.socket.send({
      questions: roomData.questions,
      index: roomData.questionIndex,
    });
  }

  public async saveUserResponse(
    client: Socket,
    { answers, questionId }: UserResponseEvent,
  ) {
    const userId = this.getUserId(client);
    if (!this.usersRooms.has(userId)) {
      throw new NotFoundException();
    }

    const roomId = this.usersRooms.get(userId);
    const roomData = this.roomData.get(roomId);
    // If there is no room data
    if (!roomData) {
      throw new NotFoundException();
    }

    // If the room isn't started
    if (roomData.status !== RoomStatus.STARTED) {
      throw new UnauthorizedException();
    }

    // If the question index is out of bounds
    if (roomData.questionIndex >= roomData.questions.length) {
      throw new UnauthorizedException();
    }

    const question = roomData.questions[roomData.questionIndex];
    // If the question doesn't exists
    if (!question) {
      throw new NotFoundException();
    }

    // If the user answer a question that is not the current one
    if (question.id !== questionId) {
      throw new UnauthorizedException();
    }

    // If the user already answered the question
    if (roomData.usersResponses.has(userId)) {
      throw new UnauthorizedException();
    }

    // Ignore if the response ID is not found or the question
    switch (question.type) {
      case 'BINARY':
        {
          // Allow only one answer that is either "true" or "false"
          if (
            answers.length !== 1 ||
            !question.choices.find((e) => e.id === answers[0])
          ) {
            throw new UnauthorizedException();
          }
        }
        break;
      case 'SINGLE':
        {
          // Allow only one answer that must be in the choices list
          if (
            answers.length !== 1 ||
            !question.choices.find((c) => c.id == answers[0])
          ) {
            throw new UnauthorizedException();
          }
        }
        break;
      case 'MULTIPLE':
        {
          // Allow multiple answers that must be in the choices list
          for (const answer of answers) {
            if (!question.choices.find((c) => c.id === answer)) {
              throw new UnauthorizedException();
            }
          }
        }
        break;
    }

    roomData.usersResponses.set(userId, {
      answers,
      time: roomData.countDown.count,
    });

    client.emit(WsEventType.USER_RESPONSE);
    this.eventEmitter.emit(WsEventType.USER_RESPONSE, roomId);
  }

  // To prevent too much computation, we're doing some caching for the next time
  private compareCache = new Map<[string, string], number>();

  private jaroWinkler(s1: string, s2: string): number {
    if (this.compareCache.has([s1, s2])) {
      return this.compareCache.get([s1, s2]);
    }

    const dist = JaroWinklerDistance(s1, s2, { ignoreCase: true });
    this.compareCache.set([s1, s2], dist);
    return dist;
  }

  public searchRooms(search: string): {
    id: RoomId;
    name: string;
  }[] {
    if (search.length === 0) {
      return [];
    }

    const rooms = Array.from(this.roomData.values());

    return rooms
      .filter((room) => room.status === RoomStatus.PENDING)
      .map((room) => {
        const data = [
          room,
          Math.min(
            this.jaroWinkler(room.quiz.name, search),
            this.jaroWinkler(room.quiz.author.username, search),
            this.jaroWinkler(room.quiz.id, search),
          ),
        ] as const;
        return data;
      })
      .sort(([, a], [, b]) => a - b)
      .filter((_, i) => i < 5)
      .map(([room]) => ({
        id: room.id as RoomId,
        name: room.quiz.name,
      }));
  }

  public sendResponsePercentage(roomId: RoomId): void {
    // If the room doesn't exist
    if (!this.hasRoom(roomId)) {
      throw new NotFoundException();
    }

    const roomData = this.roomData.get(roomId);
    const roomUsers = this.roomUsers.get(roomId);

    const percentages: RoomResponsesPercentage = {
      total: roomUsers.size,
    };

    // For each users in the room
    for (const [, resps] of roomData.usersResponses) {
      // For each response of the user
      for (const resp of resps.answers) {
        // If the response is not in the map, add it
        if (!percentages[resp]) {
          percentages[resp] = 0;
        }
        percentages[resp]++;
      }
    }

    // Users that will receive the percentage
    const destUsers: UserId[] = [];
    destUsers.push(roomData.quiz.userId as UserId);

    // Append users that did respond to the question
    for (const [userId] of roomUsers) {
      if (roomData.usersResponses.has(userId)) {
        destUsers.push(userId);
      }
    }

    // Finally, emit the percentage to all the selected users
    for (const userId of destUsers) {
      const user = roomUsers.get(userId);
      user.socket.emit(WsEventType.USER_RESPONSE_RESULT, percentages);
    }
  }

  private async computePoints(roomId: RoomId) {
    const roomData = this.roomData.get(roomId);
    const roomUsers = this.roomUsers.get(roomId);

    if (!roomData || !roomUsers) {
      throw new NotFoundException();
    }

    const question = roomData.questions[roomData.questionIndex];
    if (!question) {
      throw new NotFoundException();
    }

    // Each correct answer gives 10 point
    // Then, we multiply a bonus factor based on the time the user took to answer

    const correctAnswers = question.choices.filter((c) => c.correct);

    // For each user in the room
    for (const [userId, resps] of roomData.usersResponses) {
      let points = 0;

      // For each response of the user
      for (const resp of resps.answers) {
        const answer = correctAnswers.find((c) => c.id === resp);

        // If the answer is correct, compute the points
        if (answer) {
          points += 10;
        }
        // Otherwise, set the points to 0 for the whole question
        else {
          points = 0;
          break;
        }
      }

      // Multiply the points by the time factor (need to be inverted because the lower the time, the higher the points + smoothed with a 1 decimal factor)
      const timeFactor = resps.time / question.duration;
      points *= timeFactor;

      // Prevent negative points and round the points
      points = Math.max(0, points);
      points = Math.round(points);

      // Set the points to the user
      roomUsers.get(userId).points += points;
    }
  }

  @OnEvent(WsEventType.FINISHED_QUESTIONS, { nextTick: true })
  public async onFinishedQuestions(roomId: RoomId) {
    // When the session ends, compute the points to database
    const roomData = this.roomData.get(roomId);
    if (!roomData) {
      throw new NotFoundException();
    }

    const roomUsers = this.roomUsers.get(roomId);
    if (!roomUsers) {
      throw new NotFoundException();
    }

    // For each user in the room
    for (const [, user] of roomUsers) {
      // Compute the points
      await this.userService.addPoints(user.user, user.points);
    }
  }

  public addTime(client: Socket, time: number) {
    const userId = this.getUserId(client);
    if (!this.usersRooms.has(userId)) {
      throw new NotFoundException();
    }

    const roomId = this.usersRooms.get(userId);
    const roomData = this.roomData.get(roomId);
    // If there is no room data
    if (!roomData) {
      throw new NotFoundException();
    }

    if (roomData.status !== RoomStatus.STARTED) {
      throw new UnauthorizedException();
    }

    const owner = roomData.quiz.userId as UserId;
    if (owner !== userId) {
      throw new UnauthorizedException();
    }

    if (time < 0) {
      throw new UnauthorizedException();
    }

    roomData.countDown.count = roomData.countDown.count + time;

    this.eventEmitter.emit(WsEventType.QUESTION_ADD_TIME, roomId, time);
  }
}
