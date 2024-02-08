import { cn } from "#/utils/css";
import { LucideIcon } from "lucide-react";
import { ReactElement, ReactNode } from "react";

interface AlertProps {
  children?: ReactNode;
  priority: "error" | "warning" | "info" | "success";
  icon?: ReactElement<LucideIcon>;
}

export function Alert({ priority, icon, children }: AlertProps): JSX.Element {
  return (
    <div
      role="alert"
      className={cn("alert", {
        "alert-info": priority === "info",
        "alert-success": priority === "success",
        "alert-warning": priority === "warning",
        "alert-error": priority === "error",
      })}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}
