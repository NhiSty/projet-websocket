import { updateQuiz } from "#/api/dashboard.http";
import { QueryConstants } from "#/api/queryConstants";
import { Quiz } from "#/api/types";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon, PenIcon, TrashIcon, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useRevalidator } from "react-router-dom";
import { toast } from "sonner";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ConflictError, UnprocessableContentError } from "#/api/api";
import { Modal } from "#/components/containers/Modal";
import { Link } from "react-router-dom";
import { Button } from "#/components/form/Button";
import { DeleteQuizModal } from "../deleteQuizModal";

interface QuizTitleProps {
  quiz: Quiz;
}

interface QuizTitleUpdateModalProps {
  quiz: Quiz;
  onClose: () => void;
}

interface UpdateQuizTitleForm {
  name: string;
}

const schema = yup
    .object({
      name: yup.string().required(),
    })
    .required();

function QuizTitleUpdateModal({ quiz, onClose }: QuizTitleUpdateModalProps) {
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number | undefined>(
      undefined
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UpdateQuizTitleForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: quiz.name,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateQuizTitleForm) =>
        updateQuiz(quiz.id, data.name),
    onSuccess: async () => {
      toast.success("Quiz title updated successfully", {
        id: toastId,
        icon: <CheckCircleIcon className="w-4 h-4" />,
      });
      await queryClient.invalidateQueries({
        queryKey: [...QueryConstants.QUIZ, quiz.id],
      });
      onClose();
    },
    onError: (error) => {
      console.error(error);

      const showError = (message: string) => {
        setError("name", { message });
        toast.error(message, {
          id: toastId,
        });
      };

      if (error instanceof ConflictError) {
        showError("A quiz with that name already exists");
      } else if (error instanceof UnprocessableContentError) {
        showError("Invalid quiz name");

        for (const e of error.errors) {
          setError(e.field as keyof UpdateQuizTitleForm, {
            type: "manual",
            message: e.message,
          });
        }
      } else {
        showError("An error occurred while creating the quiz");
      }

      setToastId(undefined);
      onClose();
    },
  });

  const onProceed = async (data: UpdateQuizTitleForm) => {
    const loadingId = toast.loading("Updating quiz");
    setToastId(loadingId);
    mutation.mutate(data);
  };

  return (
      <Modal
          title="Update the quiz"
          isOpened={true}
          onProceed={() => {}}
          onClose={onClose}
          processLabel="Update"
          onSubmit={handleSubmit(onProceed)}
      >
        <FormController
            label="Quiz name"
            inputId="quizName"
            className="max-w-none"
            errorMessage={errors.name}
        >
          <Input
              id="quizName"
              type="text"
              className="max-w-none"
              placeholder="Quiz name"
              {...register("name", { required: true })}
          />
        </FormController>
      </Modal>
  );
}

export function QuizTitle({ quiz }: QuizTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const revalidate = useRevalidator();
  const navigate = useNavigate();

  useEffect(() => {
    setIsEditing(false);
  }, [quiz]);

  const onUpdateClose = useCallback(() => {
    setIsEditing(false);
    revalidate.revalidate();
  }, [revalidate]);

  return (
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="flex-1 flex flex-row items-center gap2">
          <h1 className="text-3xl font-bold">
            Quiz "<span className="font-mono italic">{quiz.name}</span>"
          </h1>

          <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => setIsEditing(true)}
              title="Edit quiz name"
          >
            <PenIcon className="w-4 h-4" />
          </button>
        </div>

        <Button
            className="btn-ghost btn-error btn-sm"
            onClick={() => setDeleting(true)}
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </Button>

        <Link
            to={`/dashboard/quizzes/${quiz.id}`}
            className="btn btn-secondary btn-sm"
        >
          <XCircle className="h-4 w-4" />
          Exit edit
        </Link>

        {isDeleting && (
            <DeleteQuizModal
                quiz={quiz}
                onDelete={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: [...QueryConstants.QUIZ, quiz.id],
                  });
                  navigate(`/dashboard/quizzes`);
                  setDeleting(false);
                }}
                onClose={() => {
                  setDeleting(false);
                }}
            />
        )}

        {isEditing && (
            <QuizTitleUpdateModal quiz={quiz} onClose={onUpdateClose} />
        )}
      </div>
  );
}
