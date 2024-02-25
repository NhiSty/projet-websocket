import { Button } from "#/components/form/Button";
import { useQuizSession } from "#/providers/quiz";
import { cn } from "#/utils/css";

interface SessionHeaderProps {
  title: string;
  sidebarExpanded?: boolean;
  onExpandSidebar?: (expand: boolean) => void;
}

export function SessionHeader({
  title,
  sidebarExpanded = false,
  onExpandSidebar,
}: SessionHeaderProps): JSX.Element {
  const { endSession, leaveSession, isOwner } = useQuizSession();

  // On the page open, connect open the websocket session
  return (
    <header className="navbar bg-base-100 border-b border-base-200">
      <div className="flex-1">
        <h1 className="text-xl">{title}</h1>
      </div>
      <div className="flex-1 gap-2 justify-end">
        {isOwner ? (
          <Button className="btn-ghost" onClick={() => endSession()}>
            End session
          </Button>
        ) : (
          <Button className="btn-ghost" onClick={() => leaveSession()}>
            Leave session
          </Button>
        )}
        <Button
          role="switch"
          aria-checked={sidebarExpanded}
          className={cn("btn-ghost", { "btn-active": sidebarExpanded })}
          onClick={() => onExpandSidebar?.(!sidebarExpanded)}
        >
          Conversation
        </Button>
      </div>
    </header>
  );
}
