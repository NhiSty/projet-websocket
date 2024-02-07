"use client";

import { Button } from "#/components/form/Button";
import { Input } from "#/components/form/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { FormController } from "#/components/form/FormController";

const schema = yup
  .object({
    username: yup.string().required(),
    password: yup.string().required(),
  })
  .required();

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => console.log(data);

  return (
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

      <Button className="btn-primary" type="submit">
        Login
      </Button>
    </form>
  );
}
