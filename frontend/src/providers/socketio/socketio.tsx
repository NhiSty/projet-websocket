import React, { PropsWithChildren, useState } from "react";
import { io, Socket } from "socket.io-client";
import { WsEventsMessages } from "./constants";

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

  const values: SocketContextData = {
    ws: createSocket(),
    isConnected,
    send,
  };

  function send({ event, ...message }: WsEventsMessages) {
    values.ws.emit(event, message);
  }

  values.ws.on("connect", () => {
    console.log("Connected to websocket");
    setConnected(true);
  });

  values.ws.on("disconnect", () => {
    console.log("Disconnected from websocket");
    setConnected(false);
  });

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
}
