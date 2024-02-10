import { cn } from "#/utils/css";
import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn("select select-bordered w-full max-w-xs", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";
