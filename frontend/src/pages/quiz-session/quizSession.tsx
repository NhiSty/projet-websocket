import { SessionHeader } from "./partials/header";
import { SessionSidebar } from "./partials/sidebar";
import { SessionContent } from "./partials/content";
import { LoaderFunction, redirect, useParams } from "react-router-dom";
import { useState } from "react";
import { useWS } from "#/providers/socketio/socketio";
import { Loader2Icon } from "lucide-react";
import { WsEventType } from "#/providers/socketio/constants";
import { QueryClient } from "@tanstack/react-query";
import { QueryConstants } from "#/api/queryConstants";
import { fetchUser } from "#/api/auth.http";
import { User } from "#/api/types";

export function quizSessionLoader(
  queryClient: QueryClient
): LoaderFunction<User> {
  return async () => {
    try {
      const value = await queryClient.fetchQuery({
        queryKey: QueryConstants.USER,
        queryFn: fetchUser,
      });

      return value;
    } catch (_) {
      /* empty */
    }
    return redirect("/");
  };
}

export function QuizSession(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { ws, isConnected, send: wsSend } = useWS();
  const [sidebarExpanded, setExpandedSidebar] = useState<boolean>(false);

  if (!id) {
    return <div>Invalid session</div>;
  }

  if (!isConnected) {
    console.log("Connecting to websocket");
    ws.connect();
    ws.on("connect", () => {
      wsSend({
        event: WsEventType.JOIN_ROOM,
        roomId: id,
      });
    });

    return (
      <div className="flex flex-col min-h-screen">
        <SessionHeader title="Loading..." />

        <div className="bg-base-300 flex-1 flex flex-col items-center justify-center">
          <Loader2Icon className="text-accent w-16 h-16 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SessionHeader
        title={""}
        onExpandSidebar={(expand) => setExpandedSidebar(expand)}
        sidebarExpanded={sidebarExpanded}
        onEndSession={() => {}}
      />

      <div className="flex flex-row flex-1">
        <SessionContent />
        {sidebarExpanded && <SessionSidebar />}
      </div>
    </div>
  );
}
