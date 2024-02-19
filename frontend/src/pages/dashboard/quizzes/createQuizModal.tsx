import { ConflictError, UnprocessableContentError } from "#/api/api";
import { createQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Modal } from "#/components/containers/Modal";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as yup from "yup";

interface CreateQuizModalProps {
  onClose: () => void;
}

interface CreateQuizForm {
  name: string;
}

const schema = yup
    .object({
      name: yup.string().required(),
    })
    .required();

export function CreateQuizModal({
                                  onClose,
                                }: CreateQuizModalProps): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [toastId, setToastId] = useState<string | number | undefined>(
      undefined
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateQuizForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateQuizForm) => createQuiz(data.name),
    onSuccess: (data) => {
      toast.success("Quiz created successfully", {
        id: toastId,
        icon: <CheckCircleIcon className="w-4 h-4" />,
      });
      queryClient.invalidateQueries({
        queryKey: QueryConstants.QUIZ_SEARCH,
      });
      onClose();
      navigate(`/dashboard/quizzes/${data.id}/edit`);
    },
    onError: (error) => {
      console.error(error);

      const showError = (message: string) => {
        setError("name", { message });
        toast.error(message, {
          id: toastId,
          icon: <XCircleIcon className="w-5 h-5" />,
        });
      };

      if (error instanceof ConflictError) {
        showError("A quiz with that name already exists");
      } else if (error instanceof UnprocessableContentError) {
        showError("Invalid quiz name");

        for (const e of error.errors) {
          setError(e.field as keyof CreateQuizForm, {
            type: "manual",
            message: e.message,
          });
        }
      } else {
        showError("An error occurred while creating the quiz");
      }

      setToastId(undefined);
    },
  });

  const onProceed = async (data: CreateQuizForm) => {
    const loadingId = toast.loading("Creating quiz");
    setToastId(loadingId);
    mutation.mutate(data);
  };

  return (
      <Modal
          title="Create a new quiz"
          isOpened={true}
          onProceed={() => {}}
          onClose={onClose}
          processLabel="Create"
          onSubmit={handleSubmit(onProceed)}
      >
        <FormController
            label="Quiz name"
            inputId="newQuizName"
            className="max-w-none"
            errorMessage={errors.name}
        >
          <Input
              id="newQuizName"
              type="text"
              className="max-w-none"
              placeholder="Quiz name"
              {...register("name", { required: true })}
          />
        </FormController>
      </Modal>
  );
}
