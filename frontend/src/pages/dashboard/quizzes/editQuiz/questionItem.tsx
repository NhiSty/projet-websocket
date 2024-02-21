import { deleteQuestion, moveQuestion } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Question } from "#/api/types";
import { Button } from "#/components/form/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpIcon,
  CheckSquareIcon,
  CircleDotIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useState, type JSX } from "react";
import { toast } from "sonner";
import { QuestionForm } from "./questionForm";
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
            "rounded-md bg-gray-100 p-4 py-2 flex flex-row items-center gap-2",
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
  showMoveUp: boolean;
  showMoveDown: boolean;
}

export function QuestionItem({
  question,
  showMoveDown,
  showMoveUp,
}: QuestionItemProps): JSX.Element {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
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

  if (editing) {
    return (
      <QuestionForm
        quizId={question.quizId}
        question={question}
        onCancel={() => setEditing(false)}
        onClose={() => setEditing(false)}
      />
    );
  }

  const onDelete = () => {
    setToastId(toast.loading("Deleting question..."));
    deleteMutation.mutate();
  };
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
        <div className="flex flex-row gap-2">
          {showMoveUp && (
            <Button title="Move up" onClick={() => moveMutation.mutate("up")}>
              <ArrowUpIcon className="w-4 h-4" />
            </Button>
          )}

          {showMoveDown && (
            <Button
              title="Move down"
              onClick={() => moveMutation.mutate("down")}
            >
              <ArrowUpIcon className="w-4 h-4 transform rotate-180" />
            </Button>
          )}

          <Button title="Edit" onClick={() => setEditing(true)}>
            <PencilIcon className="w-4 h-4" />
          </Button>

          <Button title="Delete" onClick={onDelete}>
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {(question.type === "SINGLE" || question.type === "MULTIPLE") && (
        <QuestionChoices question={question} />
      )}
    </li>
  );
}
