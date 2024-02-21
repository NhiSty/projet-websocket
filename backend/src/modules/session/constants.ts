export enum SessionEvents {
  CREATE_ROOM = 'create-room',
  DELETE_ROOM = 'delete-room',

  JOIN_ROOM = 'join-room',
  LEAVE_ROOM = 'leave-room',
  USER_JOINED = 'user-joined',
  USER_LEFT = 'user-left',
}

export enum SessionErrors {
  ROOM_FULL = 'room-full',
  ROOM_NOT_FOUND = 'room-not-found',
}
