import { Quiz } from "#/api/types";
import { PenIcon, PlayIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteLoaderData } from "react-router-dom";
import { QuestionsList } from "./viewQuiz/questionsList";

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
            to={`/dashboard/quizzes/${quiz.id}/play`}
            type="button"
            className="btn btn-primary btn-sm"
            aria-label={`Start ${quiz.name}`}
          >
            <PlayIcon className="w-4 h-4" />
            Start quiz
          </Link>

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
