import { cn } from "#/utils/css";
import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({
  type,
  className,
  ...props
}: ButtonProps): JSX.Element {
  return <button type={type} className={cn("btn", className)} {...props} />;
}
Button.displayName = "Button";
