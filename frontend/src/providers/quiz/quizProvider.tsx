import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  QuestionAddTimeEvent,
  UserInfo,
  UserJoinedEvent,
  UserLeftEvent,
  UserPointsEvent,
  WsEventType,
} from "../socketio/constants";
import { useWS } from "../socketio";
import { toast } from "sonner";
import { InfoIcon, StarsIcon } from "lucide-react";
import { Question, Quiz, RoomResponsesPercentage } from "#/api/types";
import { useUser } from "#/api/auth.queries";
import { useNavigate } from "react-router-dom";

type QuizStatus = "pending" | "starting" | "started" | "ended" | "answered";
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
  setResponse: (value: string[]) => void;
  userResponse: string[];
  usersAnswers?: RoomResponsesPercentage;
  showResults: boolean;

  addTime: (seconds: number) => void;
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
  const [userResponse, setUserResponse] = useState<string[]>([]);
  const [usersAnswers, setUsersAnswers] = useState<
    RoomResponsesPercentage | undefined
  >(undefined);
  const [showResults, setShowResults] = useState(false);

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
      setUserResponse([]);
      setCountDown(null);
      setUsersAnswers(undefined);
    });

    ws.on(WsEventType.QUESTION_COUNTDOWN, (count: number) => {
      setCountDown(count);
    });
    ws.on(WsEventType.QUESTION_COUNTDOWN_END, () => {
      setShowResults(true);
      setCountDown(null);
    });

    ws.on(WsEventType.QUESTION, (question: Question) => {
      setShowResults(false);
      setUserResponse([]);
      setStatus("started");
      setUsersAnswers(undefined);
      setQuestion(question);
    });

    ws.on(WsEventType.USER_RESPONSE, () => setStatus("answered"));

    ws.on("disconnect", () => {
      navigate("/");
    });

    ws.on(WsEventType.ALREADY_STARTED, () => {
      navigate("/");
    });

    ws.on(WsEventType.USER_RESPONSE_RESULT, (data: RoomResponsesPercentage) => {
      setUsersAnswers(data);
    });

    ws.on(WsEventType.USER_POINTS, (data: UserPointsEvent) => {
      setUsers(data.users);
    });

    ws.on(WsEventType.FINISHED_QUESTIONS, () => {
      setShowResults(true);
      setStatus("ended");
    });

    ws.on(WsEventType.QUESTION_ADD_TIME, (data: QuestionAddTimeEvent) => {
      toast.info(`Owner allowed ${data.time} extra seconds`, {
        icon: <StarsIcon className="w-5 h-5" />,
        position: "bottom-left",
      });
    });

    return () => {
      ws.off(WsEventType.USER_JOINED);
      ws.off(WsEventType.USER_LEFT);
      ws.off(WsEventType.START_SESSION);
      ws.off(WsEventType.START_COUNTDOWN);
      ws.off(WsEventType.QUESTION_COUNTDOWN);
      ws.off(WsEventType.QUESTION_COUNTDOWN_END);
      ws.off(WsEventType.QUESTION);
      ws.off(WsEventType.USER_RESPONSE);
      ws.off(WsEventType.ALREADY_STARTED);
      ws.off(WsEventType.USER_RESPONSE_RESULT);
      ws.off(WsEventType.USER_POINTS);
      ws.off(WsEventType.FINISHED_QUESTIONS);
      ws.off(WsEventType.QUESTION_ADD_TIME);
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
    setUserResponse([]);
    wsSend({
      event: WsEventType.START_SESSION,
    });
  }, [wsSend]);

  const setResponse = useCallback(
    (answers: string[]) => {
      if (!question) return;

      setUserResponse(answers);

      wsSend({
        event: WsEventType.USER_RESPONSE,
        answers,
        questionId: question.id,
      });
    },
    [wsSend, question]
  );

  const addTime = useCallback(
    (seconds: number) => {
      wsSend({
        event: WsEventType.QUESTION_ADD_TIME,
        time: seconds,
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
    userResponse,
    usersAnswers,
    showResults,
    addTime,
  };
  return <QuizContext.Provider value={values}>{children}</QuizContext.Provider>;
}
