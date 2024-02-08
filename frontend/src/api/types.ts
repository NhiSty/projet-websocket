export enum Role {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
}

export function isInRole(user: User, role: Role | Role[]): boolean {
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}

export interface User {
  id: string;
  username: string;
  role: Role;
}
