import { playQuiz } from "#/api/dashboard.http";
import { Quiz } from "#/api/types";
import { CheckBox } from "#/components/form/Checkbox";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "#/components/form/Button";
import { QueryConstants } from "#/api/queryConstants";
import { useState } from "react";
import { toast } from "sonner";
import { UnprocessableContentError } from "#/api/api";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export interface PlayQuizForm {
  sessionPassword: {
    enable: boolean;
    password?: string;
  };
  randomizeQuestions: boolean;
  userCountLimit: {
    enable: boolean;
    limit?: number;
  };
}

const schema = yup
  .object({
    sessionPassword: yup
      .object({
        enable: yup.boolean().required(),
        password: yup.string().when("enable", {
          is: true,
          then: (schema) => schema.required().min(3),
        }),
      })
      .required(),
    randomizeQuestions: yup.boolean().required(),
    userCountLimit: yup
      .object({
        enable: yup.boolean().required(),
        limit: yup.number().when("userCountLimit.enable", {
          is: true,
          then: (schema) => schema.required().min(1),
        }),
      })
      .required(),
  })
  .required();

export function PlayQuiz(): JSX.Element {
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );
  const quiz = useRouteLoaderData("playQuiz") as Quiz;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      sessionPassword: {
        enable: false,
        password: "",
      },
      randomizeQuestions: false,
      userCountLimit: {
        enable: false,
        limit: 1,
      },
    },
  });

  const mutation = useMutation({
    mutationKey: QueryConstants.START_QUIZ,
    mutationFn: (data: PlayQuizForm) => playQuiz(quiz.id, data),
    onSuccess: (data) => {
      toast.success("The quiz session has been created!", {
        id: toastId,
        icon: <CheckCircleIcon className="w-4 h-4" />,
      });
      setToastId(undefined);

      navigate(`/quiz/session/${data.roomId}`);
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
          setError(e.field as keyof PlayQuizForm, {
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

  const onSubmit = (data: PlayQuizForm) => {
    setToastId(toast.loading("Creating the quiz session..."));
    mutation.mutate(data);
  };

  return (
    <div>
      <header className="relative">
        <h1 className="text-3xl font-bold flex-1">
          Start the quiz "<span className="font-mono italic">{quiz.name}</span>"
        </h1>
      </header>

      <main>
        <form
          className="p-4 mx-auto flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row gap-4">
            {/* Session password */}
            <fieldset className="card border border-gray-200 rounded-md shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <FormController
                    inputId="enableSessionPassword"
                    className="max-w-none w-fit"
                    errorMessage={errors.sessionPassword?.enable}
                  >
                    <CheckBox
                      label="Enable session password"
                      {...register("sessionPassword.enable")}
                    />
                  </FormController>
                </h2>

                <p className="text-sm">
                  If you enable the session password, the users will need to
                  enter the password to join the session.
                </p>

                <FormController
                  inputId="sessionPassword"
                  className="max-w-none w-fit"
                  label="Session password"
                  errorMessage={errors.sessionPassword?.password}
                >
                  <Input
                    id="sessionPassword"
                    placeholder="Session password"
                    disabled={!watch("sessionPassword.enable")}
                    {...register("sessionPassword.password")}
                  />
                </FormController>
              </div>
            </fieldset>

            {/* Randomize questions */}
            <fieldset className="card border border-gray-200 rounded-md shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <FormController
                    inputId="randomizeQuestions"
                    className="max-w-none w-fit"
                    errorMessage={errors.randomizeQuestions}
                  >
                    <CheckBox
                      label="Randomize questions"
                      id="randomizeQuestions"
                      {...register("randomizeQuestions")}
                    />
                  </FormController>
                </h2>

                <p className="text-sm">
                  If you enable randomizing questions, the questions will be
                  shown in a random order to the users.
                </p>
              </div>
            </fieldset>

            {/* User count limit */}
            <fieldset className="card border border-gray-200 rounded-md shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <FormController
                    inputId="enableUserCountLimit"
                    className="max-w-none w-fit"
                    errorMessage={errors.userCountLimit?.enable}
                  >
                    <CheckBox
                      label="Enable user count limit"
                      id="enableUserCountLimit"
                      {...register("userCountLimit.enable")}
                    />
                  </FormController>
                </h2>

                <p className="text-sm">
                  If you enable the user count limit, only the first N users
                  will be able to join the session.
                </p>

                <FormController
                  inputId="userCountLimit"
                  className="max-w-none w-fit"
                  errorMessage={errors.userCountLimit?.limit}
                >
                  <Input
                    id="userCountLimit"
                    placeholder="User count limit"
                    type="number"
                    min={1}
                    disabled={!watch("userCountLimit.enable")}
                    {...register("userCountLimit.limit")}
                  />
                </FormController>
              </div>
            </fieldset>
          </div>

          {/* Start the session */}
          <Button
            type="submit"
            disabled={!isValid}
            className="col-span-3  btn-primary mx-auto max-w-screen-sm w-full"
          >
            Start the session
          </Button>
        </form>
      </main>
    </div>
  );
}
