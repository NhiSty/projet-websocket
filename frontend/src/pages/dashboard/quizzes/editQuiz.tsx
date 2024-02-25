import { Quiz } from "#/api/types";
import { useRouteLoaderData } from "react-router-dom";
import { QuizTitle } from "./editQuiz/quizTitle";
import { QuestionsList } from "./editQuiz/questionsList";

export function EditQuiz(): JSX.Element {
  const quiz = useRouteLoaderData("editQuiz") as Quiz;

  return (
    <div>
      <header className="relative">
        <QuizTitle quiz={quiz} />

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
