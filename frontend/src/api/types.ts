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

export interface Choices {
  id: string;
  choice: string;
  correct: boolean;
}

export type QuestionType = "SINGLE" | "MULTIPLE" | "TEXT" | "BINARY";

export interface Question {
  id: string;
  quizId: string;
  question: string;
  duration: number;
  type: QuestionType;
  choices: Choices[];
  position: number;
}

export interface Quiz {
  id: string;
  name: string;
  author: User;
  questions: Question[];
}
