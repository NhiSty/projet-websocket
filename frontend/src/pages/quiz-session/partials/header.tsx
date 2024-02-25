import { Button } from "#/components/form/Button";
import { useQuizSession } from "#/providers/quiz";
import { cn } from "#/utils/css";
import { AlarmClockPlusIcon } from "lucide-react";

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
  const { endSession, leaveSession, isOwner, addTime, status } =
    useQuizSession();

  // On the page open, connect open the websocket session
  return (
    <header className="navbar bg-base-100 border-b border-base-200">
      <div className="flex-1">
        <h1 className="text-xl">{title}</h1>
      </div>
      <div className="flex-1 gap-2 justify-end">
        {isOwner ? (
          <>
            {status === "started" && (
              <div className="dropdown min-w-max">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn m-1 inline-flex gap-1 w-full"
                >
                  <AlarmClockPlusIcon className="w-5 h-5" />
                  <span className="sr-only md:not-sr-only">Add Time</span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <button type="button" onClick={() => addTime(5)}>
                      Add 5 seconds
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => addTime(10)}>
                      Add 10 seconds
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => addTime(15)}>
                      Add 15 seconds
                    </button>
                  </li>
                </ul>
              </div>
            )}

            <Button className="btn-ghost" onClick={() => endSession()}>
              End session
            </Button>
          </>
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
