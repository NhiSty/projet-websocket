import { Button } from "#/components/form/Button";
import { useQuizSession } from "#/providers/quiz";
import { PropsWithChildren, useEffect, useState } from "react";
import { ContentResult } from "./contentResults";
import { ContentQuestion } from "./contentQuestion";
import { cn } from "#/utils/css";
import { ContentAdminResult } from "./contentAdminResult";

function CountDown({ countDown }: { countDown: number | null }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!countDown || countDown > 5) return;
    setPulse(true);

    const timer = setTimeout(() => setPulse(false), 5);
    return () => {
      setPulse(false);
      clearTimeout(timer);
    };
  }, [countDown]);

  return (
    countDown && (
      <p className="border bg-base-100 border-t-0 border-base-200 absolute top-0 p-2 rounded-b-lg text-center min-w-24">
        <span className="text-secondary capitalize text-xl block">Time</span>
        <span
          className={cn(
            "text-lg font-semibold uppercase block transform-gpu transition-transform duration-75",
            { "text-red-500": countDown <= 5, "scale-150": pulse }
          )}
        >
          {countDown}
        </span>
      </p>
    )
  );
}

function SessionContainer({ children }: PropsWithChildren) {
  return (
    <div className="bg-secondary-light flex-1">
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
              <h2 className="card-title">Waiting for the quiz to start...</h2>
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
  if (status === "starting") {
    return (
      <SessionContainer>
        <div className="card bg-base-100 rounded-lg border border-base-300 in">
          <div className="card-body">
            <p className="text-center text-4xl text-primary-content flex flex-col gap-2">
              <span>Starting in</span>
              <span className="font-bold">{countDown}</span>
            </p>
          </div>
        </div>
      </SessionContainer>
    );
  }

  if (isOwner) {
    return (
      <SessionContainer>
        <CountDown countDown={countDown} />
        <ContentAdminResult />
      </SessionContainer>
    );
  } else if (status === "answered") {
    return (
      <SessionContainer>
        <CountDown countDown={countDown} />
        <ContentResult />
      </SessionContainer>
    );
  } else {
    return (
      <SessionContainer>
        <CountDown countDown={countDown} />
        <ContentQuestion />
      </SessionContainer>
    );
  }
}
