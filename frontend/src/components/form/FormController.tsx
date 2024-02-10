import { cn } from "#/utils/css";
import { FieldError } from "react-hook-form";

export interface FormControllerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  inputId: string;
  label?: string;
  errorMessage?: FieldError;
}

export function FormController({
  className,
  children,
  label,
  errorMessage,
}: FormControllerProps): JSX.Element {
  return (
    <div
      className={cn("form-control max-w-xs w-full", className, {
        "input-error": Boolean(errorMessage),
      })}
    >
      {label && (
        <div className="label">
          <label className="label-text" htmlFor="email">
            {label}
          </label>
        </div>
      )}
      {children}

      {errorMessage && (
        <div className="label">
          <label className="label-text text-error" htmlFor="password">
            {errorMessage.message}
          </label>
        </div>
      )}
    </div>
  );
}
