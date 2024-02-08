import { fetcher } from "./api";
import { User } from "./types";

export interface LoginRequest {
  username: string;
  password: string;
}

export type LoginResponse = User;

export const loginUser = (data: LoginRequest) =>
  fetcher<LoginResponse>("/auth", {
    method: "POST",
    body: JSON.stringify(data),
  });

export interface RegisterRequest {
  username: string;
  password: string;
  confirmation: string;
}

export type RegisterResponse = User;

export const registerUser = (data: RegisterRequest) =>
  fetcher<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const logoutUser = () => fetcher<void>("/auth", { method: "DELETE" });

export const fetchUser = () => fetcher<User>("/auth");
