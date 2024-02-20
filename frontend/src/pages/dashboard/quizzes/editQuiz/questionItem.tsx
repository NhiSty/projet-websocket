import { deleteQuestion } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Question } from "#/api/types";
import { Button } from "#/components/form/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuestionItemProps {
  question: Question;
}

export function QuestionItem({ question }: QuestionItemProps): JSX.Element {
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );

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
        <p className="text-gray-600">{question.type}</p>
      </div>
      <div>
        <Button title="Delete" onClick={onDelete}>
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
