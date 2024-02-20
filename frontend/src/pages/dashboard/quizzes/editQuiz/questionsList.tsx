import { fetchQuestions } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { Button } from "#/components/form/Button";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useState, type ReactElement } from "react";
import { QuestionForm } from "./questionForm";
import { QuestionItem } from "./questionItem";

interface QuestionsListProps {
  quiz: Quiz;
}

export function QuestionsList({ quiz }: QuestionsListProps): ReactElement {
  const [creating, setCreating] = useState(false);
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
    <div className="flex flex-col p-8" role="list">
      {data
        ?.sort((a, b) => a.position - b.position)
        .map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            showMoveUp={index > 0}
            showMoveDown={index < data.length - 1}
          />
        ))}
      {!creating ? (
        <Button onClick={() => setCreating(true)}>
          <PlusIcon className="w-4 h-4" />
          Add an answer
        </Button>
      ) : (
        <QuestionForm
          quiz={quiz}
          onCancel={() => setCreating(false)}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
