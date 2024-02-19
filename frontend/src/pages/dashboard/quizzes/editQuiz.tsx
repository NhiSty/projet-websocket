import { fetchQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { QueryClient } from "@tanstack/react-query";
import { LoaderFunction, redirect, useRouteLoaderData } from "react-router-dom";
import { QuizTitle } from "./editQuiz/quizTitle";

export function editQuizLoader(queryClient: QueryClient): LoaderFunction<Quiz> {
  return async ({ params: { id } }) => {
    console.log("editQuizLoader", id);
    if (id && typeof id === "string") {
      console.log("fetching quiz");
      try {
        const value = await queryClient.fetchQuery({
          queryKey: [...QueryConstants.QUIZ, id],
          queryFn: () => fetchQuiz(id),
        });
        console.log("fetched quiz", value);

        return value;
      } catch (_) {
        /* empty */
      }
    }
    return redirect("/dashboard/quizzes");
  };
}

export function EditQuiz(): JSX.Element {
  const quiz = useRouteLoaderData("editQuiz") as Quiz;
  // Refresh the current route loader

  return (
    <div>
      <header className="relative">
        <QuizTitle quiz={quiz} />

        <h2 className="text-1xl text-gray-600 p-2 px-4">
          Created by <span className="italic">{quiz.author.username}</span>
        </h2>
      </header>

      <main>{/* questions list */}</main>
    </div>
  );
}
