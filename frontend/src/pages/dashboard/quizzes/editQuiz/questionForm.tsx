import { Question, QuestionType } from "#/api/types";
import { Button } from "#/components/form/Button";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { useState, type ReactElement } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QueryConstants } from "#/api/queryConstants";
import { createQuestion, updateQuestion } from "#/api/dashboard.http";
import { XCircleIcon } from "lucide-react";
import { UnprocessableContentError } from "#/api/api";
import { ChoiceForm } from "./choiceForm";
import { Select } from "#/components/form/Select";

interface QuestionFormProps {
  quizId: string;
  question?: Question;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface CreateQuestionForm {
  question: string;
  type: QuestionType;
  duration: number;
  choices?: { choice: string; correct: boolean }[];
}

const schema = yup
  .object({
    // Accepts only strings that are not empty
    question: yup.string().required().min(1),
    // Accepts only strings that are "SINGLE", "MULTIPLE", "BINARY", or "TEXT"
    type: yup
      .mixed<QuestionType>()
      .oneOf(["SINGLE", "MULTIPLE", "BINARY", "TEXT"] as QuestionType[])
      .required(),
    // Accepts only numbers that are not empty, greater than or equal to 0, and less than or equal to 60
    duration: yup.number().required().min(0).max(60).default(15),

    // Accepts only arrays that are not empty
    choices: yup
      .array()
      // The field is only required if the "type" field is "SINGLE" or "MULTIPLE"
      .when("type", {
        is: (value: string) => value === "SINGLE" || value === "MULTIPLE",
        then: (schema) => schema.required(),
      })
      .of(
        // Accepts only objects that have a "choice" field that is a string and not empty, and a "correct" field that is a boolean
        yup
          .object({
            choice: yup.string().required(),
            correct: yup.boolean().required(),
          })
          .required()
      )
      // Accepts only arrays that have at least 2 elements
      .min(2)
      // This validation is a bit more trickier :
      // Accept only if there is exactly 1 correct choice if the "type" field is "SINGLE",
      // or at least 1 correct choice if the "type" field is "MULTIPLE"
      .test(
        "at-least-one-correct",
        "At least one choice must be correct",
        (choices, context) => {
          if (!choices) {
            return false;
          }

          const { type } = context.parent;
          const correctChoices = choices.filter((choice) => choice.correct);

          if (type === "SINGLE") {
            return correctChoices.length === 1;
          } else if (type === "MULTIPLE") {
            return correctChoices.length > 0;
          }

          return false;
        }
      ),
  })
  .required();

export function QuestionForm({
  quizId,
  question,
  onCancel,
  onClose,
}: QuestionFormProps): ReactElement {
  const queryClient = useQueryClient();
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );

  const formHook = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      question: question?.question || "",
      type: question?.type || "SINGLE",
      duration: question?.duration || 15,
      choices: question?.choices || [],
    },
  });

  const {
    handleSubmit,
    register,
    setError,
    formState: { errors, isValid },
  } = formHook;

  const mutation = useMutation({
    mutationKey: [...QueryConstants.QUIZ_QUESTION, quizId],
    mutationFn: (data: CreateQuestionForm) =>
      question
        ? updateQuestion(
            quizId,
            question.id,
            data.question,
            data.type,
            data.duration,
            data.choices
          )
        : createQuestion(
            quizId,
            data.question,
            data.type,
            data.duration,
            data.choices
          ),
    onSuccess: () => {
      toast.success("Question created successfully", {
        id: toastId,
      });
      queryClient.invalidateQueries({
        queryKey: [...QueryConstants.QUIZ_QUESTIONS, quizId],
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

  const questionType = formHook.watch("type");

  return (
    <div className="card bg-base-100 shadow-xl border border-gray-100">
      <FormProvider {...formHook}>
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
              <Select
                id="type"
                defaultValue={question?.type}
                required
                disabled={!!question}
                {...register("type")}
              >
                <option value="SINGLE">Single Choice</option>
                <option value="MULTIPLE">Multiple Choice</option>
                <option value="BINARY">True/False</option>
                <option value="TEXT">Short Answer</option>
              </Select>
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

          {(questionType === "SINGLE" || questionType === "MULTIPLE") && (
            <ChoiceForm type={questionType} />
          )}

          <div className="card-actions justify-end gap-2">
            <Button className="btn-sm btn-ghost" onClick={() => onCancel?.()}>
              Cancel
            </Button>
            <Button disabled={!isValid} className="btn-sm btn-primary">
              Save
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
