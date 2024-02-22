import { useContext } from "react";
import { QuizContextData, QuizContext } from "./quizProvider";

export function useQuizSession(): QuizContextData {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizSession must be used within a QuizProvider");
  }
  return context;
}
