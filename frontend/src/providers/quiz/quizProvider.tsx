import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  UserInfo,
  UserJoinedEvent,
  UserLeftEvent,
  WsEventType,
} from "../socketio/constants";
import { useWS } from "../socketio";
import { toast } from "sonner";
import { InfoIcon } from "lucide-react";
import { Question, Quiz } from "#/api/types";
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

  question: Question | null;
  setResponse: (questionId: string, value: string[]) => void;
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

  const [question, setQuestion] = useState<Question | null>(null);

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

    ws.on(WsEventType.QUESTION_COUNTDOWN, (count: number) => {
      setCountDown(count);
    });
    ws.on(WsEventType.QUESTION_COUNTDOWN_END, () => {
      setCountDown(null);
      setQuestion(null);
    });

    ws.on(WsEventType.QUESTION, (question: Question) => {
      setQuestion(question);
    });

    ws.on("disconnect", () => {
      navigate("/");
    });

    return () => {
      ws.off(WsEventType.USER_JOINED);
      ws.off(WsEventType.USER_LEFT);
      ws.off(WsEventType.START_SESSION);
      ws.off(WsEventType.START_COUNTDOWN);
      ws.off(WsEventType.QUESTION_COUNTDOWN);
      ws.off(WsEventType.QUESTION_COUNTDOWN_END);
      ws.off(WsEventType.QUESTION);
      ws.off("disconnect");
    };
  }, [navigate, user?.id, ws]);

  const endSession = useCallback(() => {
    wsSend({
      event: WsEventType.END_SESSION,
    });
  }, [wsSend]);

  const leaveSession = useCallback(() => {
    ws.disconnect();
  }, [ws]);

  const startQuiz = useCallback(() => {
    wsSend({
      event: WsEventType.START_SESSION,
    });
  }, [wsSend]);

  const setResponse = useCallback(
    (questionId: string, answers: string[]) => {
      wsSend({
        event: WsEventType.USER_RESPONSE,
        answers,
        questionId,
      });
    },
    [wsSend]
  );

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
    question,
    setResponse,
  };
  return <QuizContext.Provider value={values}>{children}</QuizContext.Provider>;
}
