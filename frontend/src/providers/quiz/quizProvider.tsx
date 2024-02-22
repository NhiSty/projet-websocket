import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  UserInfo,
  UserJoinedEvent,
  UserLeftEvent,
  WsEventType,
} from "../socketio/constants";
import { useWS } from "../socketio/socketio";
import { toast } from "sonner";
import { InfoIcon } from "lucide-react";
import { Quiz } from "#/api/types";
import { useUser } from "#/api/auth.queries";
import { useNavigate } from "react-router-dom";

export interface QuizContextData {
  users: UserInfo[];
  quiz: Quiz | null;
  setQuiz: (quiz: Quiz | null) => void;
  endSession: () => void;
  leaveSession: () => void;
  isOwner: boolean;
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

    ws.on("disconnect", () => {
      navigate("/");
    });

    return () => {
      ws.off(WsEventType.USER_JOINED);
      ws.off(WsEventType.USER_LEFT);
    };
  }, [ws]);

  function endSession() {
    wsSend({
      event: WsEventType.END_SESSION,
    });
  }

  function leaveSession() {
    ws.disconnect();
  }

  const values: QuizContextData = {
    users,
    quiz,
    setQuiz,
    endSession,
    leaveSession,
    isOwner: user?.id === quiz?.author.id,
  };
  return <QuizContext.Provider value={values}>{children}</QuizContext.Provider>;
}

export function useQuizSession(): QuizContextData {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizSession must be used within a QuizProvider");
  }
  return context;
}
