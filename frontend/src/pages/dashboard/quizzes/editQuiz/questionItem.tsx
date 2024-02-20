import { deleteQuestion, moveQuestion } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Question } from "#/api/types";
import { Button } from "#/components/form/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuestionItemProps {
  question: Question;
  showMoveUp: boolean;
  showMoveDown: boolean;
}

export function QuestionItem({
  question,
  showMoveDown,
  showMoveUp,
}: QuestionItemProps): JSX.Element {
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );

  const moveMutation = useMutation({
    mutationKey: [...QueryConstants.MOVE_QUESTION, question.id],
    mutationFn: (direction: "up" | "down") => moveQuestion(question, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QueryConstants.QUIZ_QUESTIONS, question.quizId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationKey: [...QueryConstants.DELETE_QUESTION, question.id],
    mutationFn: () => deleteQuestion(question),
    onSuccess: () => {
      toast.success("Question deleted successfully", { id: toastId });
      queryClient.invalidateQueries({
        queryKey: [...QueryConstants.QUIZ_QUESTIONS, question.quizId],
      });
    },
  });

  const onDelete = () => {
    setToastId(toast.loading("Deleting question..."));
    deleteMutation.mutate();
  };
  return (
    <div
      key={question.id}
      role="listitem"
      className="flex justify-between items-center p-4 border-b border-gray-200"
    >
      <div>
        <h3 className="text-lg font-bold">{question.question}</h3>
        <p className="text-gray-600">
          <span className="font-bold">Type: </span>
          {question.type}
        </p>
      </div>
      <div className="flex flex-row gap-2">
        {showMoveUp && (
          <Button title="Move up" onClick={() => moveMutation.mutate("up")}>
            <ArrowUpIcon className="w-4 h-4" />
          </Button>
        )}

        {showMoveDown && (
          <Button title="Move down" onClick={() => moveMutation.mutate("down")}>
            <ArrowUpIcon className="w-4 h-4 transform rotate-180" />
          </Button>
        )}

        <Button title="Delete" onClick={onDelete}>
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
