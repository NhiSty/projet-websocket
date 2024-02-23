import { useQuizSession } from "#/providers/quiz";

export function ContentResult(): JSX.Element {
  const { question } = useQuizSession();

  return (
    <div>
      <div className="card bg-base-100 rounded-lg border border-base-300">
        <div className="card-body">
          <h2 className="card-title">{question?.question}</h2>
        </div>
      </div>
    </div>
  );
}
