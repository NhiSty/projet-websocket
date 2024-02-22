import { SessionHeader } from "./partials/header";
import { SessionSidebar } from "./partials/sidebar";
import { SessionContent } from "./partials/content";
import {
  LoaderFunction,
  redirect,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { useWS } from "#/providers/socketio/socketio";
import { Loader2Icon } from "lucide-react";
import { WsErrorType, WsEventType } from "#/providers/socketio/constants";
import { QueryClient } from "@tanstack/react-query";
import { QueryConstants } from "#/api/queryConstants";
import { fetchUser } from "#/api/auth.http";
import { User } from "#/api/types";
import { useQuizSession } from "#/providers/quiz/quizProvider";
import { PasswordModal } from "./partials/passwordModal";
import { ErrorModal } from "./partials/ErrorModal";

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

type ErrorState = "password-required" | "ok" | "invalid-password" | "room-full";

export function QuizSession(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { ws, send: wsSend } = useWS();
  const [sidebarExpanded, setExpandedSidebar] = useState<boolean>(false);
  const { setQuiz, quiz } = useQuizSession();

  const [errorState, setErrorState] = useState<ErrorState>("ok");

  const navigate = useNavigate();

  useEffect(() => {
    // Bind all the events
    ws.on("connect", () => {
      if (!id) return;
      wsSend({ event: WsEventType.JOIN_ROOM, roomId: id });
    });
    ws.on(WsEventType.ROOM_INFO, (data) => {
      setErrorState("ok");
      setQuiz(data.quiz);
    });
    ws.on(WsEventType.SESSION_ENDED, () => navigate("/"));

    // Bind all the errors
    ws.on(WsErrorType.REQUIRE_PASSWORD, () =>
      setErrorState("password-required")
    );
    ws.on(WsErrorType.INVALID_PASSWORD, () =>
      setErrorState("invalid-password")
    );
    ws.on(WsErrorType.ROOM_NOT_FOUND, () => navigate("/"));
    ws.on(WsErrorType.ROOM_FULL, () => setErrorState("room-full"));

    return () => {
      wsSend({ event: WsEventType.LEAVE_ROOM });

      ws.off("connect");
      ws.off(WsErrorType.ROOM_FULL);
      ws.off(WsEventType.ROOM_INFO);
      ws.off(WsErrorType.REQUIRE_PASSWORD);
      ws.off(WsErrorType.INVALID_PASSWORD);
      ws.off(WsErrorType.ROOM_NOT_FOUND);
      ws.off(WsEventType.SESSION_ENDED);
    };
  }, [id, navigate, setQuiz, ws, wsSend]);

  if (!id) {
    return <div>Invalid session</div>;
  }

  if (errorState === "password-required") {
    return (
      <div className="flex flex-col min-h-screen">
        <SessionHeader title="Loading..." />

        <div className="bg-secondary/50 flex-1 flex flex-col items-center justify-center">
          <PasswordModal roomId={id} />
        </div>
      </div>
    );
  } else if (errorState === "invalid-password") {
    return (
      <div className="flex flex-col min-h-screen">
        <SessionHeader title="Loading..." />

        <div className="bg-secondary/50 flex-1 flex flex-col items-center justify-center">
          <ErrorModal error="A password is required to access this room" />
        </div>
      </div>
    );
  } else if (errorState === "room-full") {
    return (
      <div className="flex flex-col min-h-screen">
        <SessionHeader title="Loading..." />

        <div className="bg-secondary/50 flex-1 flex flex-col items-center justify-center">
          <ErrorModal error="This room is full" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    console.log("Connecting to websocket");
    ws.connect();

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
        title={quiz.name}
        onExpandSidebar={(expand) => setExpandedSidebar(expand)}
        sidebarExpanded={sidebarExpanded}
      />

      <div className="flex flex-row flex-1">
        <SessionContent />
        {sidebarExpanded && <SessionSidebar />}
      </div>
    </div>
  );
}
