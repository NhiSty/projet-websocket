import { Quiz } from "#/api/types";
import { Button } from "#/components/form/Button";
import { cn } from "#/utils/css";
import { MenuIcon, XIcon } from "lucide-react";

interface SessionHeaderProps {
  title: string;
  sidebarExpanded?: boolean;
  onExpandSidebar?: (expand: boolean) => void;
  onEndSession?: () => void;
}

export function SessionHeader({
  title,
  sidebarExpanded = false,
  onExpandSidebar,
  onEndSession,
}: SessionHeaderProps): JSX.Element {
  // On the page open, connect open the websocket session
  return (
    <header className="navbar bg-base-100 border-b border-base-200">
      <div className="flex-1">
        <h1 className="text-xl">{title}</h1>
      </div>
      <div className="flex-1 gap-2 justify-end">
        <Button className="btn btn-ghost" onClick={() => onEndSession?.()}>
          End session
        </Button>
        <Button
          className="btn-square btn-ghost"
          onClick={() => onExpandSidebar?.(!sidebarExpanded)}
        >
          <span
            className={cn("swap swap-rotate", {
              "swap-active": sidebarExpanded,
            })}
          >
            <MenuIcon className="w-5 h-5 swap-off" />
            <XIcon className="w-5 h-5 swap-on" />
          </span>
        </Button>
      </div>
    </header>
  );
}
