import { deleteQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { Modal } from "#/components/containers/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteQuizModalProps {
  quiz: Quiz;
  onClose?: () => void;
  onDelete?: () => void;
}

export function DeleteQuizModal({
  quiz,
  onClose,
  onDelete,
}: DeleteQuizModalProps): JSX.Element {
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number | undefined>();

  const mutation = useMutation({
    mutationKey: QueryConstants.DELETE_QUIZ,
    mutationFn: () => deleteQuiz(quiz.id),
    onSuccess: () => {
      toast.success("Quiz deleted", {
        id: toastId,
        icon: <CheckCircleIcon className="w-4 h-4" />,
      });
      queryClient.invalidateQueries({
        queryKey: QueryConstants.QUIZ_SEARCH,
      });
      onClose?.();
      onDelete?.();
    },
    onError: (error) => {
      console.error(error);

      toast.error("An error occurred while deleting the quiz", {
        id: toastId,
        icon: <XCircleIcon className="w-5 h-5" />,
      });

      setToastId(undefined);
      onClose?.();
    },
  });

  const onProceed = async () => {
    const loadingId = toast.loading("Deleting quiz");
    setToastId(loadingId);
    mutation.mutate();
  };

  return (
    <Modal
      title="Delete quiz"
      isOpened={true}
      onProceed={onProceed}
      onClose={onClose ?? (() => {})}
      processLabel="Delete"
    >
      <p>Are you sure you want to delete {quiz.name}?</p>
    </Modal>
  );
}
