import { fetchQuestions } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { type ReactElement } from "react";
import { QuestionItem } from "./questionItem";

interface QuestionsListProps {
  quiz: Quiz;
}

export function QuestionsList({ quiz }: QuestionsListProps): ReactElement {
  const { data, isLoading, isPending, isError } = useQuery({
    queryKey: [...QueryConstants.QUIZ_QUESTIONS, quiz.id],
    queryFn: () => fetchQuestions(quiz.id),
  });

  if (isLoading || isPending) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2Icon className="text-accent w-14 h-14 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-center text-error">
          An error occurred while fetching administrators.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col p-8 gap-2">
      {data
        ?.sort((a, b) => a.position - b.position)
        .map((question) => (
          <QuestionItem key={question.id} question={question} />
        ))}
    </ul>
  );
}
