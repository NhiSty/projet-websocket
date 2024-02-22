import { useContext } from "react";
import { SocketContextData, SocketContext } from "./socketio";

export function useWS(): SocketContextData {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useWS must be used within a SocketProvider");
  }
  return context;
}
