import { PlayQuizForm } from "#/pages/dashboard/quizzes/playQuiz";
import { Paginated } from "#/utils/pagination";
import { fetcher } from "./api";
import { Choices, Question, Quiz, User } from "./types";

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
  return fetcher<SearchQuizResponse>(
    `/admins/quizzes?search=${search}&page=${page}`,
    {
      method: "GET",
    }
  );
};

export const createQuiz = (name: string) => {
  return fetcher<{ id: string }>("/admins/quizzes", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
};

export const deleteQuiz = (id: string) => {
  return fetcher<void>(`/admins/quizzes/${id}`, {
    method: "DELETE",
  });
};

export const fetchQuiz = (id: string) => fetcher<Quiz>(`/admins/quizzes/${id}`);

export const updateQuiz = (id: string, name: string) => {
  return fetcher<void>(`/admins/quizzes/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
};

export const fetchQuestions = (id: string) =>
  fetcher<Question[]>(`admins/quizzes/${id}/questions`);

export const createQuestion = (
  quizId: string,
  name: string,
  type: string,
  duration: number,
  choices?: Pick<Choices, "choice" | "correct">[]
) => {
  return fetcher<Question>(`/admins/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify({ name, type, duration, choices }),
  });
};

export const updateQuestion = (
  quizId: string,
  questionId: string,
  name: string,
  type: string,
  duration: number,
  choices?: Pick<Choices, "choice" | "correct">[]
) => {
  return fetcher<Question>(
    `/admins/quizzes/${quizId}/questions/${questionId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name, type, duration, choices }),
    }
  );
};

export const deleteQuestion = (question: Question) => {
  return fetcher<void>(
    `/admins/quizzes/${question.quizId}/questions/${question.id}`,
    {
      method: "DELETE",
    }
  );
};

export const moveQuestion = (question: Question, direction: "up" | "down") => {
  return fetcher<void>(
    `/admins/quizzes/${question.quizId}/questions/${question.id}/move?direction=${direction}`,
    {
      method: "PATCH",
    }
  );
};

export const playQuiz = (id: string, data: PlayQuizForm) => {
  return fetcher<{ roomId: string }>(`/quizzes/${id}/play`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};
