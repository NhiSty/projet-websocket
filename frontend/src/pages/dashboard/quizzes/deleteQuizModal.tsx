import { deleteQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { Modal } from "#/components/containers/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

interface DeleteQuizModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export function DeleteQuizModal({
  quiz,
  onClose,
}: DeleteQuizModalProps): JSX.Element {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: QueryConstants.DELETE_QUIZ,
    mutationFn: () => deleteQuiz(quiz.id),
    onSuccess: () => {
      toast.success("Quiz deleted", {
        icon: <CheckCircleIcon className="w-4 h-4" />,
      });
      queryClient.invalidateQueries({
        queryKey: QueryConstants.QUIZ_SEARCH,
      });
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Something went wrong", {
        icon: <XCircleIcon className="w-5 h-5" />,
      });
      onClose();
    },
  });

  const onProceed = async () => {
    mutation.mutate();
  };

  return (
    <Modal
      title="Delete quiz"
      isOpened={true}
      onProceed={onProceed}
      onClose={onClose}
      processLabel="Delete"
    >
      <p>Are you sure you want to delete {quiz.name}?</p>
    </Modal>
  );
}
