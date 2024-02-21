import { cn } from "#/utils/css";
import { InputHTMLAttributes, forwardRef } from "react";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
};

export const CheckBox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="label cursor-pointer gap-2">
        <input
          type="checkbox"
          className={cn("checkbox checkbox-primary", className)}
          ref={ref}
          {...props}
        />
        <span className="label-text">{label}</span>
      </label>
    );
  }
);
CheckBox.displayName = "CheckBox";
