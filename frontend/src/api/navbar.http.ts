import { fetcher } from "./api";

export interface RoomItem {
  id: string;
  name: string;
}

export const searchRoom = (search: string) =>
  fetcher<{ rooms: RoomItem[] }>(`/quizzes/search?search=${search}`, {
    method: "POST",
  });
