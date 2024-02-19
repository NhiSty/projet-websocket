import { Paginated } from "#/utils/pagination";
import { fetcher } from "./api";
import { Quiz, User } from "./types";

type SearchUsersResponse = Paginated<Omit<User, "password">>;

export const searchAdmins = (search: string, page: number) => {
  return fetcher<SearchUsersResponse>(
    `/admins/users?search=${search}&page=${page}`,
    {
      method: "GET",
    }
  );
};

export const deleteUser = (id: string) => {
  return fetcher<void>(`/admins/users/${id}`, {
    method: "DELETE",
  });
};

export const updateUser = (id: string, role: string) => {
  return fetcher<void>(`/admins/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
};

export interface CreateUser {
  username: string;
  password: string;
  confirmation: string;
  role: string;
}

export const createUser = (data: CreateUser) => {
  return fetcher<void>("/admins/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

type SearchQuizResponse = Paginated<Quiz>;

export const searchQuiz = (search: string, page: number) => {
  return fetcher<SearchQuizResponse>(`/quizzes?search=${search}&page=${page}`, {
    method: "GET",
  });
};

export const createQuiz = (name: string) => {
  return fetcher<void>("/quizzes", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
};