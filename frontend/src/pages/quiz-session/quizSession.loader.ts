import { fetchUser } from "#/api/auth.http";
import { QueryConstants } from "#/api/queryConstants";
import { User } from "#/api/types";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunction, redirect } from "react-router-dom";

export function quizSessionLoader(
  queryClient: QueryClient
): LoaderFunction<User> {
  return async () => {
    try {
      const value = await queryClient.fetchQuery({
        queryKey: QueryConstants.USER,
        queryFn: fetchUser,
      });

      return value;
    } catch (_) {
      /* empty */
    }
    return redirect("/");
  };
}
