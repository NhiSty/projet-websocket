import { fetchQuestions } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { Button } from "#/components/form/Button";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { type ReactElement } from "react";

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
    <div className="flex flex-col p-8">
      {data?.map((question) => {
        return (
          <div
            key={question.id}
            className="flex justify-between items-center p-4 border-b border-gray-200"
          >
            <div>
              <h3 className="text-lg font-bold">{question.question}</h3>
              <p className="text-gray-600">{question.type}</p>
            </div>
            <div>
              <Button className="mr-2">Edit</Button>
              <Button>Delete</Button>
            </div>
          </div>
        );
      })}
      <Button className="">
        <PlusIcon className="w-4 h-4" />
        Add an answer
      </Button>
    </div>
  );
}
