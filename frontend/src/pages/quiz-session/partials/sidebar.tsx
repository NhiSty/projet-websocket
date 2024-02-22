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
    <aside className="bg-white w-96 md:max-w-md md:w-full relative flex flex-col">
      <header className="p-4 sticky top-0 bg-white z-10">
        <div role="tablist" className="tabs tabs-boxed">
          <button
            type="button"
            role="tab"
            className={cn("tab relative inline-flex items-center gap-2", {
              "tab-active": currentTab === "chat",
            })}
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
