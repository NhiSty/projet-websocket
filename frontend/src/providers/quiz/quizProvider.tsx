import React, { PropsWithChildren, useEffect, useState } from "react";
import {
  UserInfo,
  UserJoinedEvent,
  UserLeftEvent,
  WsEventType,
} from "../socketio/constants";
import { useWS } from "../socketio";
import { toast } from "sonner";
import { InfoIcon } from "lucide-react";
import { Quiz } from "#/api/types";
import { useUser } from "#/api/auth.queries";
import { useNavigate } from "react-router-dom";

type QuizStatus = "pending" | "starting" | "started" | "ended";
export interface QuizContextData {
  users: UserInfo[];
  quiz: Quiz | null;
  setQuiz: (quiz: Quiz | null) => void;
  endSession: () => void;
  leaveSession: () => void;
  isOwner: boolean;
  status: QuizStatus;
  startQuiz: () => void;
  countDown: number | null;
}

export const QuizContext = React.createContext<QuizContextData | undefined>(
  undefined
);

type QuizProviderProps = PropsWithChildren<object>;

export function QuizProvider({ children }: QuizProviderProps) {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const { ws, send: wsSend } = useWS();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const { data: user } = useUser();
  const navigate = useNavigate();
  const [status, setStatus] = useState<QuizStatus>("pending");
  const [countDown, setCountDown] = useState<number | null>(null);

  useEffect(() => {
    ws.on(WsEventType.USER_JOINED, (data: UserJoinedEvent) => {
      if (data.user.id != user?.id) {
        toast.info(`${data.user.username} joined the room`, {
          position: "bottom-left",
          icon: <InfoIcon className="w-5 h-5" />,
        });
      }

      setUsers(data.users);
    });
    ws.on(WsEventType.USER_LEFT, (data: UserLeftEvent) => {
      if (data.user.id != user?.id) {
        toast.info(`${data.user.username} left the room`, {
          position: "bottom-left",
          icon: <InfoIcon className="w-5 h-5" />,
        });
      }

      setUsers(data.users);
    });
    ws.on(WsEventType.START_COUNTDOWN, (count: number) => {
      setStatus("starting");
      setCountDown(count);
    });
    ws.on(WsEventType.START_SESSION, () => {
      setStatus("started");
      setCountDown(null);
    });

    ws.on("disconnect", () => {
      navigate("/");
    });

    return () => {
      ws.off(WsEventType.USER_JOINED);
      ws.off(WsEventType.USER_LEFT);
      ws.off(WsEventType.START_SESSION);
      ws.off("disconnect");
    };
  }, [navigate, user?.id, ws]);

  function endSession() {
    wsSend({
      event: WsEventType.END_SESSION,
    });
  }

  function leaveSession() {
    ws.disconnect();
  }

  function startQuiz() {
    wsSend({
      event: WsEventType.START_SESSION,
    });
  }

  const values: QuizContextData = {
    users,
    quiz,
    setQuiz,
    endSession,
    leaveSession,
    isOwner: user?.id === quiz?.author.id,
    status,
    startQuiz,
    countDown,
  };
  return <QuizContext.Provider value={values}>{children}</QuizContext.Provider>;
}
