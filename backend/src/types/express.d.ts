import { User } from '@prisma/client';
import { UserId } from './opaque';

declare module 'express-session' {
  interface SessionData {
    userId: UserId;
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}
