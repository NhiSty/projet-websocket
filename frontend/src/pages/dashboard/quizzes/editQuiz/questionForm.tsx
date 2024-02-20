import { Question, QuestionType, Quiz } from "#/api/types";
import { Button } from "#/components/form/Button";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QueryConstants } from "#/api/queryConstants";
import { createQuestion } from "#/api/dashboard.http";
import { XCircleIcon } from "lucide-react";
import { UnprocessableContentError } from "#/api/api";

interface QuestionFormProps {
  quiz: Quiz;
  question?: Question;
  onCancel?: () => void;
  onClose?: () => void;
}

interface CreateQuestionForm {
  question: string;
  type: QuestionType;
  duration: number;
}

const schema = yup
  .object({
    question: yup.string().required(),
    type: yup
      .mixed<QuestionType>()
      .oneOf(["SINGLE", "MULTIPLE", "BINARY", "TEXT"] as QuestionType[])
      .required(),
    duration: yup.number().required().min(0).max(60).default(15),
  })
  .required();

export function QuestionForm({
  quiz,
  question,
  onCancel,
  onClose,
}: QuestionFormProps): ReactElement {
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      question: question?.question || "",
      type: question?.type || "SINGLE",
      duration: question?.duration || 15,
    },
  });

  const mutation = useMutation({
    mutationKey: [...QueryConstants.QUIZ_QUESTION, quiz.id],
    mutationFn: (data: CreateQuestionForm) =>
      createQuestion(quiz.id, data.question, data.type, data.duration),
    onSuccess: () => {
      toast.success("Question created successfully", {
        id: toastId,
      });
      queryClient.invalidateQueries({
        queryKey: [...QueryConstants.QUIZ_QUESTIONS, quiz.id],
      });
      onClose?.();
    },
    onError: (error) => {
      console.error(error);

      const showError = (message: string) => {
        toast.error(message, {
          icon: <XCircleIcon className="w-5 h-5" />,
          id: toastId,
        });
      };

      if (error instanceof UnprocessableContentError) {
        showError("Invalid data");

        for (const e of error.errors) {
          setError(e.field as keyof CreateQuestionForm, {
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

  const onProcess = (data: CreateQuestionForm) => {
    const loadingId = toast.loading("Creating quiz");
    setToastId(loadingId);
    mutation.mutate(data);
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-100">
      <form className="card-body" onSubmit={handleSubmit(onProcess)}>
        <h3 className="card-title">
          {question ? "Edit" : "Create"} a question
        </h3>

        <FormController
          inputId="question"
          label="Question"
          className="max-w-none"
          errorMessage={errors.question}
        >
          <Input
            id="question"
            placeholder="What is the capital of France?"
            defaultValue={question?.question}
            className="max-w-none"
            required
            {...register("question")}
          />
        </FormController>

        <div className="flex flex-col md:flex-row gap-4">
          <FormController
            inputId="type"
            label="Question Type"
            errorMessage={errors.type}
            className="flex-1 max-w-none"
          >
            <select
              id="type"
              className="select select-bordered w-full"
              defaultValue={question?.type}
              required
              {...register("type")}
            >
              <option value="SINGLE" selected>
                Single Choice
              </option>
              <option value="MULTIPLE">Multiple Choice</option>
              <option value="BINARY">True/False</option>
              <option value="TEXT">Short Answer</option>
            </select>
          </FormController>

          <FormController
            inputId="duration"
            label="Duration (in seconds)"
            errorMessage={errors.duration}
            className="flex-1 max-w-none"
          >
            <Input
              id="duration"
              type="number"
              placeholder="Duration (in seconds)"
              defaultValue={question?.duration}
              className="max-w-none"
              required
              min={0}
              max={60}
              {...register("duration")}
            />
          </FormController>
        </div>

        <div className="card-actions justify-end gap-2">
          <Button className="btn-sm btn-ghost" onClick={() => onCancel?.()}>
            Cancel
          </Button>
          <Button className="btn-sm btn-primary">Save</Button>
        </div>
      </form>
    </div>
  );
}
