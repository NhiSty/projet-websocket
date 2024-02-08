import { cn } from "#/utils/css";
import { HTMLAttributes, ReactNode } from "react";

export enum TextType {
  Primary = "text-primary-content",
  Neutral = "text-neutral-content",
}

export enum BgType {
  Primary = "bg-primary",
  Neutral = "bg-neutral",
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   * Background color of the button (in HEX format)
   * @default handled by component
   * @example "#ff0000"
   */
  bgType: BgType;
  textType: TextType;
  title: string;
}

export function Card(props: CardProps): JSX.Element {
  return (
    <div
      className={cn("card w-96", props.textType, props.bgType, props.className)}
    >
      <div className="card-body">
        <div className="card-title">{props.title}</div>
        {props.children}
        <div className="card-actions justify-end"></div>
      </div>
    </div>
  );
}
Card.displayName = "Card";
