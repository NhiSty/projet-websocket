import { cn } from "#/utils/css";
import {
  InfoIcon,
  MessageSquareIcon,
  MessageSquareMoreIcon,
} from "lucide-react";
import { useState } from "react";
import { ChatZone } from "./chatZone";
import { SessionInfo } from "./sessionInfo";
import { useWsChat } from "#/providers/chat";

export function SessionSidebar(): JSX.Element {
  const { hasNewMessages } = useWsChat();
  const [currentTab, setCurrentTab] = useState<"chat" | "info">("chat");

  return (
    <aside className="bg-white md:w-96 md:max-w-md z-10 md:z-0 md:relative flex flex-col absolute top-0 left-0 bottom-0 right-0">
      <header className="p-4 sticky top-0 bg-white">
        <div role="tablist" className="tabs tabs-boxed flex flex-row">
          <button
            type="button"
            role="tab"
            className={cn(
              "tab flex-1 relative inline-flex items-center gap-2",
              {
                "tab-active": currentTab === "chat",
              }
            )}
            onClick={() => setCurrentTab("chat")}
          >
            {hasNewMessages > 0 && (
              <span className="absolute right-2 badge badge-error text-white">
                {hasNewMessages}
              </span>
            )}
            <div className={cn("swap", { "swap-active": hasNewMessages > 0 })}>
              <MessageSquareMoreIcon className="w-5 h-5 text-error swap-on" />
              <MessageSquareIcon className="w-5 h-5 swap-off" />
            </div>
            Chat
          </button>
          <button
            role="tab"
            type="button"
            className={cn("flex-1 tab inline-flex items-center gap-2", {
              "tab-active": currentTab === "info",
            })}
            onClick={() => setCurrentTab("info")}
          >
            <InfoIcon className="w-5 h-5" />
            Participants
          </button>
        </div>
      </header>

      <div className="flex-1">
        {currentTab === "chat" ? <ChatZone /> : <SessionInfo />}
      </div>
    </aside>
  );
}
