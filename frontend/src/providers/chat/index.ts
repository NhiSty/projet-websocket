import { useContext } from "react";
import { ChatContextData, ChatContext } from "./chat";

export function useWsChat(): ChatContextData {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useWsChat must be used within a ChatProvider");
  }
  return context;
}
