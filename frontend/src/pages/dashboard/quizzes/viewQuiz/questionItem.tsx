import { Question } from "#/api/types";
import { CheckSquareIcon, CircleDotIcon } from "lucide-react";
import { type JSX } from "react";
import { cn } from "#/utils/css";

interface QuestionChoicesProps {
  question: Question;
}

function QuestionChoices({ question }: QuestionChoicesProps) {
  let icon: JSX.Element | null = null;

  if (question.type === "SINGLE") {
    icon = <CircleDotIcon className="w-4 h-4" />;
  } else if (question.type === "MULTIPLE") {
    icon = <CheckSquareIcon className="w-4 h-4" />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {question.choices.map((choices) => (
        <li
          key={choices.id}
          className={cn(
            "rounded-md bg-gray-100 p-4 py-2 flex flex-row items-center gap-2 border border-gray-300",
            { "text-success": choices.correct }
          )}
        >
          {icon}
          {choices.choice}
        </li>
      ))}
    </ul>
  );
}

interface QuestionItemProps {
  question: Question;
}

export function QuestionItem({ question }: QuestionItemProps): JSX.Element {
  return (
    <li className="flex flex-col p-4 border-b border-gray-200 gap-2 last:border-none">
      <div className="flex flex-row justify-between items-center last:border-none">
        <div>
          <h3 className="text-lg font-bold">{question.question}</h3>
          <p className="text-gray-600">
            <span className="font-bold">Type: </span>
            {question.type}
          </p>
        </div>
      </div>

      {(question.type === "SINGLE" || question.type === "MULTIPLE") && (
        <QuestionChoices question={question} />
      )}
    </li>
  );
}
