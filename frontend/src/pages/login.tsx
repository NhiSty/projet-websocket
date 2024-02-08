"use client";

import { Button } from "#/components/form/Button";
import { Input } from "#/components/form/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { FormController } from "#/components/form/FormController";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "#/api/auth.http";
import { LucideLoader2, LucideLogIn } from "lucide-react";
import { QueryConstants } from "#/api/queryConstants";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const schema = yup
  .object({
    username: yup.string().required(),
    password: yup.string().required(),
  })
  .required();

type LoginData = yup.InferType<typeof schema>;

export function Login() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginData) => loginUser(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QueryConstants.USER, data);
      navigate("/");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: LoginData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <form
        className="flex flex-col gap-2 py-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-semibold">Login</h2>

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

        <Button
          className="btn-primary mt-4 inline-flex gap-2"
          type="submit"
          disabled={!isValid || mutation.isPending}
        >
          Login
          {mutation.isPending ? (
            <LucideLoader2 className="animate-spin w-5 h-5" />
          ) : (
            <LucideLogIn className="w-5 h-5" />
          )}
        </Button>
      </form>
      <div className="flex flex-col justify-center py-2">
        <Link className="link-hover link-secondary text-sm" to="/register">
          Not registered? Register here
        </Link>
      </div>
    </>
  );
}
