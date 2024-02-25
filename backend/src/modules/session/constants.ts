import { RoomId } from 'src/types/opaque';
import { Quiz } from '@prisma/client';

export enum WsEventType {
  IS_COMPOSING = 'is-compositing',
  COMPOSING_END = 'composing-end',

  CHAT_MESSAGE = 'chat-message',

  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',

  USER_JOINED = 'user-joined',
  USER_LEFT = 'user-left',

  ROOM_INFO = 'room-info',

  START_COUNTDOWN = 'start-countdown',
  START_SESSION = 'start-session',
  END_SESSION = 'end-session',
  SESSION_ENDED = 'session-ended',

  QUESTION_COUNTDOWN = 'question-countdown',
  QUESTION_COUNTDOWN_END = 'question-countdown-end',
  QUESTION = 'question',
  NEXT_QUESTION = 'next-question',
  FINISHED_QUESTIONS = 'finished-questions',

  USER_RESPONSE = 'user-response',
  USER_RESPONSE_RESULT = 'user-response-result',
}

export enum WsErrorType {
  ROOM_FULL = 'room-full',
  ROOM_NOT_FOUND = 'room-not-found',
  ALREADY_STARTED = 'already-started',
  ALREADY_FINISHED = 'already-finished',
  REQUIRE_PASSWORD = 'require-password',
  INVALID_PASSWORD = 'invalid-password',
  UNKNOWN_ERROR = 'unknown-error',
}

export interface WsEvent<WsEvent> {
  event: WsEvent;
}

export interface UserInfo {
  username: string;
  id: string;
}

export interface ComposingEvent extends WsEvent<WsEventType.IS_COMPOSING> {
  users: UserInfo[];
}
export interface ComposingEnd extends WsEvent<WsEventType.COMPOSING_END> {
  users: UserInfo[];
}

export interface RoomInfoEvent extends WsEvent<WsEventType.ROOM_INFO> {
  quiz: Quiz;
}

export interface ChatMessageEvent extends WsEvent<WsEventType.CHAT_MESSAGE> {
  message: string;
  user: UserInfo;
  timestamp: number;
}

export interface JoinRoomEvent extends WsEvent<WsEventType.JOIN_ROOM> {
  roomId: RoomId;
  password?: string;
}
export interface LeaveRoomEvent extends WsEvent<WsEventType.LEAVE_ROOM> {}

export interface UserJoinedEvent extends WsEvent<WsEventType.USER_JOINED> {
  userId: string;
  username: string;
}

export interface UserLeftEvent extends WsEvent<WsEventType.USER_LEFT> {
  userId: string;
  username: string;
}

export interface StartRoomEvent extends WsEvent<WsEventType.START_SESSION> {}

export interface StartCountdownEvent
  extends WsEvent<WsEventType.START_COUNTDOWN> {}

export interface EndSessionEvent extends WsEvent<WsEventType.END_SESSION> {}

export interface SessionEndedEvent extends WsEvent<WsEventType.SESSION_ENDED> {}

export interface UserResponseEvent extends WsEvent<WsEventType.USER_RESPONSE> {
  answers: string[];
  questionId: string;
}

export type WsEventsMessages =
  | ComposingEvent
  | ComposingEnd
  | ChatMessageEvent
  | JoinRoomEvent
  | LeaveRoomEvent;

export const ROOM_BEGIN_COUNTDOWN = 5;
