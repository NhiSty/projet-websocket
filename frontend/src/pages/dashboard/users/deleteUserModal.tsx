import { deleteUser } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { User } from "#/api/types";
import { Modal } from "#/components/containers/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
}

export function DeleteUserModal({
  user,
  onClose,
}: DeleteUserModalProps): JSX.Element {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: QueryConstants.DELETE_USER,
    mutationFn: () => deleteUser(user.id),
    onSuccess: () => {
      toast.success("User deleted", {
        icon: <CheckCircleIcon className="w-4 h-4" />,
      });
      queryClient.invalidateQueries({
        queryKey: QueryConstants.USERS_SEARCH,
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
      title="Delete user"
      isOpened={true}
      onProceed={onProceed}
      onClose={onClose}
      processLabel="Delete"
    >
      <p>Are you sure you want to delete {user.username}?</p>
    </Modal>
  );
}
