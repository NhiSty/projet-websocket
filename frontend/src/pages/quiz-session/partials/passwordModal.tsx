import { Button } from "#/components/form/Button";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { useWS } from "#/providers/socketio/socketio";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { WsEventType } from "#/providers/socketio/constants";

const schema = yup
  .object({
    password: yup.string().required("Password is required").min(1),
  })
  .required();

export function PasswordModal({ roomId }: { roomId: string }): JSX.Element {
  const { send: wsSend } = useWS();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (data: yup.InferType<typeof schema>) => {
    wsSend({
      event: WsEventType.JOIN_ROOM,
      roomId,
      password: data.password,
    });
  };

  return (
    <div className="card bg-base-100 rounded-lg border border-base-300">
      <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
        <div className="card-title">
          A password is required to access this room
        </div>

        <div className="py-4 flex flex-row items-start gap-4">
          <FormController
            inputId="password"
            errorMessage={errors.password}
            className="flex-1"
          >
            <Input
              id="password"
              type="password"
              placeholder="Room password"
              {...register("password")}
            />
          </FormController>
          <Button type="submit" className="btn-primary" disabled={!isValid}>
            Join
          </Button>
        </div>
      </form>
    </div>
  );
}
