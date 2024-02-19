import { fetchQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunction, redirect, useRouteLoaderData } from "react-router-dom";

export function viewQuizLoader(queryClient: QueryClient): LoaderFunction<Quiz> {
  return async ({ params: { id } }) => {
    if (id && typeof id === "string") {
      try {
        const value = await queryClient.fetchQuery({
          queryKey: QueryConstants.QUIZ,
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

export function ViewQuiz(): JSX.Element {
  const quiz = useRouteLoaderData("viewQuiz") as Quiz;
  console.log(quiz);
  return (
    <div>
      <header className="relative">
        <h1 className="text-3xl font-bold">
          Quiz "<span className="font-mono italic">{quiz.name}</span>"
        </h1>

        <h2 className="text-1xl text-gray-600 p-2 px-4">
          Created by <span className="italic">{quiz.author.username}</span>
        </h2>
      </header>

      <main>{/* questions list */}</main>
    </div>
  );
}
