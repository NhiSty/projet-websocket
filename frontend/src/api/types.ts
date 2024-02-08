export enum Role {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  USER = "user",
}

export interface User {
  id: string;
  username: string;
  role: Role;
}
