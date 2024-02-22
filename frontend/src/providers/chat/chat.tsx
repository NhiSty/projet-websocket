import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWS } from "../socketio/socketio";
import {
  ChatMessageEvent,
  ComposingEvent,
  UserInfo,
  WsEventType,
} from "../socketio/constants";

export interface MessageData {
  from: UserInfo;
  content: string;
  timestamp: number;
}

interface ChatContextData {
  history: MessageData[];
  sendMessage: () => void;
  setText: (content: string) => void;
  text: string;
  composingUsers: UserInfo[];
  hasNewMessages: number;
  readNewMessages: () => void;
}

export const ChatContext = React.createContext<ChatContextData | undefined>(
  undefined
);

type ChatProviderProps = PropsWithChildren<object>;

const TIME_TO_COMPOSE = 4500;

export function ChatProvider({ children }: ChatProviderProps) {
  const { ws, send: wsSend } = useWS();
  const [history, setHistory] = useState<MessageData[]>([]);
  const [text, setText] = useState<string>("");
  const [composingUsers, setComposingUsers] = useState<UserInfo[]>([]);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [hasNewMessages, setHasNewMessages] = useState<number>(0);

  // Handle all the events
  useEffect(() => {
    ws.on(WsEventType.CHAT_MESSAGE, (data: ChatMessageEvent) => {
      const msg: MessageData = {
        content: data.message,
        timestamp: data.timestamp,
        from: data.user,
      };
      setHistory((prevHistory) => [...prevHistory, msg]);
      setHasNewMessages((prev) => prev + 1);
    });

    ws.on(WsEventType.IS_COMPOSING, (data: ComposingEvent) => {
      setComposingUsers(data.users);
    });

    return () => {
      wsSend({
        event: WsEventType.COMPOSING_END,
      });
      ws.off(WsEventType.CHAT_MESSAGE);
      ws.off(WsEventType.IS_COMPOSING);
    };
  }, [ws, wsSend]);

  // Method called to send composing event
  const compose = useCallback(
    (composing: boolean) => {
      setLastCheck(Date.now());
      setIsComposing(composing);
      wsSend({
        event: composing ? WsEventType.IS_COMPOSING : WsEventType.COMPOSING_END,
      });
    },
    [wsSend]
  );

  // Method to handle composing when the user is writing
  useEffect(() => {
    // If the the text is empty, the user is not composing
    if (text.length === 0) {
      if (isComposing) {
        compose(false);
      }
      return;
    }

    // Send the event that the user is still composing
    if (lastCheck + TIME_TO_COMPOSE < Date.now()) {
      compose(true);
    }

    // The user is composing, set a timeout to send the composing event
    const timeout = window.setTimeout(() => {
      compose(false);
    }, TIME_TO_COMPOSE);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [text]);

  // Method to send the message
  function sendMessage() {
    if (text.length === 0) {
      return;
    }

    wsSend({
      event: WsEventType.CHAT_MESSAGE,
      message: text,
    });
    setText("");
  }

  const values: ChatContextData = {
    history,
    sendMessage,
    setText,
    text,
    composingUsers,
    hasNewMessages,
    readNewMessages: () => setHasNewMessages(0),
  };

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
}

export function useWsChat(): ChatContextData {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useWsChat must be used within a ChatProvider");
  }
  return context;
}
