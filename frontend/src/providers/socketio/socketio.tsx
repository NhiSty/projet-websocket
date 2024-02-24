import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { WsErrorType, WsEventsMessages } from "./constants";
import { toast } from "sonner";
import { XCircleIcon } from "lucide-react";

export interface SocketContextData {
  ws: Socket;
  isConnected: boolean;
  send: (message: WsEventsMessages) => void;
}

export const SocketContext = React.createContext<SocketContextData | undefined>(
  undefined
);

type SocketProviderProps = PropsWithChildren<object>;

function createSocket(): Socket {
  return io("/", {
    autoConnect: false,
    transports: ["websocket"],
  });
}

export function WebSocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setConnected] = useState<boolean>(false);
  const socket = useMemo(createSocket, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to websocket");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from websocket");
      setConnected(false);
    });

    socket.on(WsErrorType.UNKNOWN_ERROR, (error) => {
      console.error(error);
      toast.error("An unknown error occurred", {
        position: "bottom-left",
        icon: <XCircleIcon className="w-5 h-5" />,
      });
    });

    return () => {
      socket.close();
    };
  }, [socket]);

  const send = useCallback(
    ({ event, ...message }: WsEventsMessages) => {
      socket.emit(event, message);
    },
    [socket]
  );

  const values: SocketContextData = {
    ws: socket,
    isConnected,
    send,
  };

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
}
