import { Button } from "#/components/form/Button";
import { useQuizSession } from "#/providers/quiz";
import { PropsWithChildren } from "react";

function SessionContainer({ children }: PropsWithChildren) {
  return (
    <div className="bg-secondary/50 flex-1">
      <div className="flex items-center justify-center h-full">{children}</div>
    </div>
  );
}

export function SessionContent(): JSX.Element {
  const { isOwner, quiz, status, startQuiz } = useQuizSession();

  if (!quiz) {
    return (
      <SessionContainer>
        <p className="text-2xl font-semibold text-secondary/500">Loading...</p>
      </SessionContainer>
    );
  }

  if (status === "pending") {
    if (isOwner) {
      return (
        <SessionContainer>
          <div className="card bg-base-100 rounded-lg border border-base-300">
            <div className="card-body">
              <h2 className="card-title">
                Start the quiz whenever you are ready
              </h2>

              <Button onClick={() => startQuiz()} className="btn btn-primary">
                Start the quiz
              </Button>
            </div>
          </div>
        </SessionContainer>
      );
    } else {
      return (
        <SessionContainer>
          <div className="card bg-base-100 rounded-lg border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Wait for the quiz to start...</h2>
            </div>
          </div>
        </SessionContainer>
      );
    }
  }

  return (
    <div className="bg-secondary/50 flex-1">
      <p>Quiz started</p>
    </div>
  );
}
