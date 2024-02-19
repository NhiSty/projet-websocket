import { updateUser } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Role, User } from "#/api/types";
import { Modal } from "#/components/containers/Modal";
import { FormController } from "#/components/form/FormController";
import { Select } from "#/components/form/Select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UpdateUserModalProps {
  user: User;
  onClose: () => void;
}

export function UpdateUserModal({
  user,
  onClose,
}: UpdateUserModalProps): JSX.Element {
  const queryClient = useQueryClient();

  const [role, setRole] = useState<Role>(user.role);

  const mutation = useMutation({
    mutationKey: QueryConstants.DELETE_USER,
    mutationFn: (role: Role) => updateUser(user.id, role),
    onSuccess: () => {
      toast.success("User updated", {
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
    },
  });

  const onProceed = async () => {
    mutation.mutate(role);
  };

  return (
    <Modal
      title={`Update user ${user.username}`}
      isOpened={true}
      onProceed={onProceed}
      onClose={onClose}
      processLabel="Update"
    >
      <FormController
        label="Select a role"
        inputId="newRole"
        className="max-w-none"
      >
        <Select
          id="newRole"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="max-w-none"
        >
          {Object.values(Role)
            .filter((r) => r != Role.SUPERADMIN)
            .map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
        </Select>
      </FormController>
    </Modal>
  );
}
