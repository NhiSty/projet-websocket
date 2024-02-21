export enum WsEventType {
  IS_COMPOSING = "is-compositing",
  COMPOSING_END = "composing-end",

  CHAT_MESSAGE = "chat-message",

  JOIN_ROOM = "join-room",
  REQUIRE_PASSWORD = "require-password",
  LEAVE_ROOM = "leave-room",

  USER_JOINED = "user-joined",
  USER_LEFT = "user-left",
}

export interface WsEvent<WsEvent> {
  event: WsEvent;
}

export interface ComposingEvent extends WsEvent<WsEventType.IS_COMPOSING> {}
export interface ComposingEnd extends WsEvent<WsEventType.COMPOSING_END> {}

export interface ChatMessageEvent extends WsEvent<WsEventType.CHAT_MESSAGE> {
  message: string;
}

export interface JoinRoomEvent extends WsEvent<WsEventType.JOIN_ROOM> {
  roomId: string;
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

export type WsEventsMessages =
  | ComposingEvent
  | ComposingEnd
  | ChatMessageEvent
  | JoinRoomEvent
  | LeaveRoomEvent;
