import { Question } from "#/api/types";
import { useQuizSession } from "#/providers/quiz";
import { cn } from "#/utils/css";
import {
  CheckSquare,
  CircleDotIcon,
  CircleIcon,
  Loader2Icon,
  SquareIcon,
} from "lucide-react";

function AnswersList({
  question,
  response,
}: {
  question: Question;
  response: string[];
}) {
  const { usersAnswers, showResults } = useQuizSession();
  const Icon = question.type === "MULTIPLE" ? SquareIcon : CircleIcon;
  const CheckIcon = question.type === "MULTIPLE" ? CheckSquare : CircleDotIcon;

  if (!usersAnswers) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 justify-around">
      {question.choices.map((item) => {
        const count = usersAnswers[item.id] || 0;
        return (
          <div
            key={item.id}
            className={cn(
              "btn group px-6 cursor-default relative overflow-clip"
            )}
          >
            <progress
              value={count}
              max={usersAnswers.total}
              className={cn(
                "absolute inset-0 w-full h-full progress bg-transparent appearance-none rounded-none",
                "[&::-webkit-progress-bar]:rounded-l-none [&::-webkit-progress-value]:rounded-l-none",
                {
                  "progress-primary": !showResults,
                  "progress-success": item.correct && showResults,
                  "progress-error": !item.correct && showResults,
                }
              )}
            />
            <div className="z-[1] inline-flex gap-4 justify-center w-full h-full items-center">
              <div
                className={cn("swap", {
                  "swap-active": response.includes(item.id),
                })}
              >
                <Icon
                  aria-hidden="true"
                  className="w-5 h-5 text-gray-600 group-hover:text-current swap-off"
                />
                <CheckIcon className="w-5 h-5 text-current swap-on" />
              </div>
              <span className="flex-1">{item.choice}</span>
              <span className="text-sm">
                {Math.ceil((count / usersAnswers.total) * 100)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ContentResult(): JSX.Element {
  const { question, userResponse } = useQuizSession();

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2Icon className="text-accent w-14 h-14 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="card bg-base-100 rounded-lg border border-base-300">
        <div className="card-body">
          <h2 className="card-title">{question?.question}</h2>
        </div>
      </div>

      <div className="mx-auto max-w-screen-lg w-full">
        <AnswersList question={question} response={userResponse} />
      </div>
    </div>
  );
}
