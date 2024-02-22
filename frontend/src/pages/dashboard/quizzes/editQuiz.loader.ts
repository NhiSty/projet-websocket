import { fetchQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunction, redirect } from "react-router-dom";

export function editQuizLoader(queryClient: QueryClient): LoaderFunction<Quiz> {
  return async ({ params: { id } }) => {
    if (id && typeof id === "string") {
      try {
        const value = await queryClient.fetchQuery({
          queryKey: [...QueryConstants.QUIZ, id],
          queryFn: () => fetchQuiz(id),
        });

        return value;
      } catch (_) {
        /* empty */
      }
    }
    return redirect("/dashboard/quizzes");
  };
}
