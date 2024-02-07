"use client";

import { Button } from "#/components/form/Button";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

const schema = yup
  .object({
    username: yup.string().required(),
    password: yup.string().required(),
    confirmation: yup.string().required(),
  })
  .required();

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = (data: any) => console.log(data);

  return (
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

      <Button className="btn-primary mt-4" type="submit">
        Register
      </Button>
    </form>
  );
}
