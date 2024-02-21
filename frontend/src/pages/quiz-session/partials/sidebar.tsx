import { cn } from "#/utils/css";
import {
  InfoIcon,
  MessageSquareIcon,
  MessageSquareMoreIcon,
} from "lucide-react";
import { useState } from "react";
import { ChatZone } from "./chatZone";
import { SessionInfo } from "./sessionInfo";

interface SessionSidebarProps {}

export function SessionSidebar({}: SessionSidebarProps): JSX.Element {
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<"chat" | "info">("chat");

  return (
    <aside className="bg-white w-96 md:max-w-md md:w-full flex flex-col">
      <header className="p-4">
        <div role="tablist" className="tabs tabs-boxed">
          <button
            type="button"
            role="tab"
            className={cn("tab inline-flex items-center gap-2", {
              "tab-active": currentTab === "chat",
            })}
            onClick={() => setCurrentTab("chat")}
          >
            {hasNewMessages ? (
              <MessageSquareMoreIcon className="w-5 h-5" />
            ) : (
              <MessageSquareIcon className="w-5 h-5" />
            )}
            Chat
          </button>
          <button
            role="tab"
            type="button"
            className={cn("tab inline-flex items-center gap-2", {
              "tab-active": currentTab === "info",
            })}
            onClick={() => setCurrentTab("info")}
          >
            <InfoIcon className="w-5 h-5" />
            Info
          </button>
        </div>
      </header>

      <div className="flex-1">
        {currentTab === "chat" ? <ChatZone /> : <SessionInfo />}
      </div>
    </aside>
  );
}
