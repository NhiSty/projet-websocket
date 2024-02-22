import { UnauthorizedException } from '@nestjs/common';

export class RoomFullExceptions extends UnauthorizedException {
  public constructor() {
    super('Room is full');
  }
}

export class RoomStartedExceptions extends UnauthorizedException {
  public constructor() {
    super('Room is already started');
  }
}

export class RoomEndedExceptions extends UnauthorizedException {
  public constructor() {
    super('Room is finished');
  }
}

export class RoomRequirePasswords extends UnauthorizedException {
  public constructor() {
    super('Room requires a password');
  }
}

export class RoomInvalidPassword extends UnauthorizedException {
  public constructor() {
    super('Invalid password');
  }
}
