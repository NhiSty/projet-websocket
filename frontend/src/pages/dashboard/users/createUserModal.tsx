import { ConflictError, UnprocessableContentError } from "#/api/api";
import { CreateUser, createUser } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Role, User, isInRole } from "#/api/types";
import { Modal } from "#/components/containers/Modal";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { Select } from "#/components/form/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouteLoaderData } from "react-router-dom";
import { toast } from "sonner";
import * as yup from "yup";

interface CreateUserModalProps {
  onClose: () => void;
}

interface CreateUserForm {
  username: string;
  role: Role;
  password: string;
  confirmation: string;
}

const schema = yup
  .object({
    username: yup.string().required(),
    role: yup.mixed<Role>().oneOf(Object.values(Role)).required(),
    password: yup.string().required(),
    confirmation: yup.string().required(),
  })
  .required();

export function CreateUserModal({
  onClose,
}: CreateUserModalProps): JSX.Element {
  const currentUser = useRouteLoaderData("dashboard") as User;
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateUserForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      role: Role.USER,
      password: "",
      confirmation: "",
    },
  });

  const mutation = useMutation({
    mutationKey: QueryConstants.DELETE_USER,
    mutationFn: (data: CreateUser) => createUser(data),
    onSuccess: () => {
      toast.success("User updated", {
        icon: <CheckCircleIcon className="w-4 h-4" />,
        id: toastId,
      });
      queryClient.invalidateQueries({
        queryKey: QueryConstants.ADMIN_SEARCH,
      });
      onClose();
    },
    onError: (error) => {
      console.error(error);

      const showError = (message: string) => {
        toast.error(message, {
          icon: <XCircleIcon className="w-5 h-5" />,
          id: toastId,
        });
      };

      if (error instanceof ConflictError) {
        showError("Username already exists");
      } else if (error instanceof UnprocessableContentError) {
        showError("Invalid data");

        for (const e of error.errors) {
          setError(e.field as keyof CreateUserForm, {
            type: "manual",
            message: e.message,
          });
        }
      } else {
        showError("Something went wrong");
      }

      setToastId(undefined);
    },
  });

  const onProceed = async (data: CreateUserForm) => {
    const loadingId = toast.loading("Creating user");
    setToastId(loadingId);
    mutation.mutate(data);
  };

  return (
    <Modal
      title="Create new user"
      isOpened={true}
      onProceed={() => {}}
      onClose={onClose}
      processLabel="Create"
      onSubmit={handleSubmit(onProceed)}
    >
      <FormController
        label="Username"
        inputId="newUsername"
        className="max-w-none"
        errorMessage={errors.username}
      >
        <Input
          id="newUsername"
          type="text"
          className="max-w-none"
          placeholder="Username"
          {...register("username", { required: true })}
        />
      </FormController>

      {isInRole(currentUser, Role.SUPERADMIN) && (
        <FormController
          label="Select a role"
          inputId="newRole"
          className="max-w-none"
          errorMessage={errors.role}
        >
          <Select id="newRole" className="max-w-none" {...register("role")}>
            {Object.values(Role)
              .filter((r) => r !== Role.SUPERADMIN)
              .map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
          </Select>
        </FormController>
      )}

      <FormController
        label="Password"
        inputId="newPassword"
        className="max-w-none"
        errorMessage={errors.password}
      >
        <Input
          id="newPassword"
          type="password"
          className="max-w-none"
          placeholder="Password"
          {...register("password", { required: true })}
        />
      </FormController>

      <FormController
        label="Confirmation"
        inputId="newConfirmation"
        className="max-w-none"
        errorMessage={errors.confirmation}
      >
        <Input
          id="newConfirmation"
          type="password"
          className="max-w-none"
          placeholder="Confirmation"
          {...register("confirmation", { required: true })}
        />
      </FormController>
    </Modal>
  );
}