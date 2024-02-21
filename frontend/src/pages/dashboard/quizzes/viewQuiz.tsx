import { fetchQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { QueryClient } from "@tanstack/react-query";
import { PenIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { LoaderFunction, redirect, useRouteLoaderData } from "react-router-dom";
import { QuestionsList } from "./viewQuiz/questionsList";
import React from "react";

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
  return (
    <div>
      <header className="relative">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <h1 className="text-3xl font-bold flex-1">
            Quiz "<span className="font-mono italic">{quiz.name}</span>"
          </h1>

          <Link
            to={`/dashboard/quizzes/${quiz.id}/edit`}
            className="btn btn-primary btn-sm"
          >
            <PenIcon className="h-4 w-4" />
            Edit
          </Link>
        </div>

        <h2 className="text-1xl text-gray-600 p-2 px-4">
          Created by <span className="italic">{quiz.author.username}</span>
        </h2>
      </header>

      <main>
        <QuestionsList quiz={quiz} />
      </main>
    </div>
  );
}
