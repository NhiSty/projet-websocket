"use client";

import { Button } from "#/components/form/Button";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "#/api/auth.http";
import { QueryConstants } from "#/api/queryConstants";
import { useNavigate } from "react-router-dom";
import { LucideLoader2, LucideLogIn, XCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const schema = yup
  .object({
    username: yup.string().required(),
    password: yup.string().required(),
    confirmation: yup.string().required(),
  })
  .required();

type RegisterData = yup.InferType<typeof schema>;

export function Register() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterData) => registerUser(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QueryConstants.USER, data);
      navigate("/");
      toast.success("Welcome!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Something went wrong", {
        icon: <XCircleIcon className="w-5 h-5" />,
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <form
        className="flex flex-col gap-2 py-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-semibold">Register</h2>

        <FormController
          label="Username"
          inputId="username"
          errorMessage={errors.username}
        >
          <Input
            type="text"
            id="username"
            placeholder="Username"
            {...register("username", { required: true })}
          />
        </FormController>

        <FormController
          label="Password"
          inputId="password"
          errorMessage={errors.password}
        >
          <Input
            type="password"
            id="password"
            placeholder="Password"
            {...register("password", { required: true })}
          />
        </FormController>

        <FormController
          label="Confirm Password"
          inputId="confirmation"
          errorMessage={errors.confirmation}
        >
          <Input
            type="password"
            id="confirmation"
            placeholder="Confirm password"
            {...register("confirmation", { required: true })}
          />
        </FormController>

        <Button
          className="btn-primary mt-4 inline-flex gap-2"
          type="submit"
          disabled={!isValid || mutation.isPending}
        >
          Register
          {mutation.isPending ? (
            <LucideLoader2 className="animate-spin w-5 h-5" />
          ) : (
            <LucideLogIn className="w-5 h-5" />
          )}
        </Button>
      </form>
      <div className="flex flex-col justify-center py-2">
        <Link className="link-hover link-secondary text-sm" to="/login">
          Already have an account? Login
        </Link>
      </div>
    </>
  );
}
