import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useWS } from "../socketio";
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

export interface ChatContextData {
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
  const { ws, send: wsSend, isConnected } = useWS();
  const [history, setHistory] = useState<MessageData[]>([]);
  const [text, setText] = useState<string>("");
  const [composingUsers, setComposingUsers] = useState<UserInfo[]>([]);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [hasNewMessages, setHasNewMessages] = useState<number>(0);

  const [textTimeout, setTextTimeout] = useState<number | undefined>(undefined);

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
      if (isConnected) {
        wsSend({
          event: WsEventType.COMPOSING_END,
        });
      }
      ws.off(WsEventType.CHAT_MESSAGE);
      ws.off(WsEventType.IS_COMPOSING);

      window.clearTimeout(textTimeout);
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
  function updateText(value: string) {
    setText(value);

    if (textTimeout) {
      window.clearTimeout(textTimeout);
      setTextTimeout(undefined);
    }
    // If the the text is empty, the user is not composing
    if (value.length === 0) {
      if (isComposing) {
        compose(false);
      }
      return;
    }

    // Send the event that the user is still composing
    if (lastCheck + TIME_TO_COMPOSE < Date.now() || !isComposing) {
      compose(true);
    }

    // The user is composing, set a timeout to send the composing event
    const timeout = window.setTimeout(() => {
      compose(false);
      setTextTimeout(undefined);
    }, TIME_TO_COMPOSE);
    setTextTimeout(timeout);
  }

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
    compose(false);
  }

  const values: ChatContextData = {
    history,
    sendMessage,
    setText: updateText,
    text,
    composingUsers,
    hasNewMessages,
    readNewMessages: () => setHasNewMessages(0),
  };

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
}
