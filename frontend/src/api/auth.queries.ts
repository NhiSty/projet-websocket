import { QueryClient, useQuery } from "@tanstack/react-query";
import { QueryConstants } from "./queryConstants";
import { fetchUser, logoutUser } from "./auth.http";
import { redirect } from "react-router-dom";

export const useUser = () =>
  useQuery({
    queryKey: QueryConstants.USER,
    queryFn: async () => {
      try {
        return await fetchUser();
      } catch (error) {
        return null;
      }
    },
  });

export const logoutAction = (queryClient: QueryClient) => async () => {
  console.log("Logging out");
  try {
    await logoutUser();
  } catch (e) {
    // We don't really care about the result of the logout action
  }
  await queryClient.invalidateQueries({ queryKey: QueryConstants.USER });
  await queryClient.prefetchQuery({ queryKey: QueryConstants.USER });
  return redirect("/");
};
