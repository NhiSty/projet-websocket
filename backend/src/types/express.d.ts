import { User } from '@prisma/client';

declare module 'express-session' {
  interface SessionData {
    userId: User['id'];
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}
