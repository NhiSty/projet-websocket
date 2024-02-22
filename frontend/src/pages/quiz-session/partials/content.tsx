import { Button } from "#/components/form/Button";
import { useQuizSession } from "#/providers/quiz";
import { PropsWithChildren } from "react";
import { ContentResult } from "./contentResults";
import { ContentQuestion } from "./contentQuestion";

function SessionContainer({ children }: PropsWithChildren) {
  return (
    <div className="bg-secondary/50 flex-1">
      <div className="flex items-center justify-center h-full relative">
        {children}
      </div>
    </div>
  );
}

export function SessionContent(): JSX.Element {
  const { isOwner, quiz, status, startQuiz, countDown } = useQuizSession();

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

  if (status === "ended") {
    return (
      <SessionContainer>
        <div className="card bg-base-100 rounded-lg border border-base-300">
          <div className="card-body">
            {/* TODO: change the text and add more informations */}
            <h2 className="card-title">The session is ended</h2>
          </div>
        </div>
      </SessionContainer>
    );
  }

  // FROM HERE, THE STATUS IS "STARTED" OR "STARTING"

  if (!isOwner) {
    return (
      <SessionContainer>
        {countDown && (
          <p className="border bg-base-100 border-t-0 border-base-200 absolute top-0 p-2 rounded-b-lg text-center">
            <div className="text-secondary capitalize text-xl">Starting in</div>
            <div className="text-lg font-semibold uppercase">{countDown}</div>
          </p>
        )}
        <ContentResult />
      </SessionContainer>
    );
  } else {
    if (status === "starting") {
      return (
        <SessionContainer>
          <div className="card bg-base-100 rounded-lg border border-base-300 in">
            <div className="card-body">
              <p className="text-center text-4xl text-primary-content flex flex-col gap-2">
                <div>Starting in</div>
                <div className="font-bold">{countDown}</div>
              </p>
            </div>
          </div>
        </SessionContainer>
      );
    } else {
      return (
        <SessionContainer>
          <ContentQuestion />
        </SessionContainer>
      );
    }
  }

  return <div className="bg-secondary/50 flex-1"></div>;
}
