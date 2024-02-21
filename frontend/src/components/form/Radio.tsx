import { cn } from "#/utils/css";
import { InputHTMLAttributes, forwardRef } from "react";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="label cursor-pointer gap-2">
        <input
          type="radio"
          className={cn("radio", className)}
          ref={ref}
          {...props}
        />
        <span className="label-text">{props.label}</span>
      </label>
    );
  }
);
Radio.displayName = "Radio";
