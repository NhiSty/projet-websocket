import React, { PropsWithChildren, useContext, useState } from "react";
import { io, Socket } from "socket.io-client";
import { WsEventsMessages } from "./constants";

interface SocketContextData {
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

export function useWS(): SocketContextData {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useWS must be used within a SocketProvider");
  }
  return context;
}
