import { cn } from "#/utils/css";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("input input-bordered w-full max-w-xs", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
