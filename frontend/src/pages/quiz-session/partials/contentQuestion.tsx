import { Question } from "#/api/types";
import { Input } from "#/components/form/Input";
import { useQuizSession } from "#/providers/quiz";
import {
  CheckSquare,
  CircleDotIcon,
  CircleIcon,
  Loader2,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";

function AnswersList({
  question,
  setResponse,
}: {
  question: Question;
  setResponse: (values: string[]) => void;
}) {
  const [inputs, setInputs] = useState<string[]>([]);

  useEffect(() => {
    setInputs([]);
  }, [question.type]);

  useEffect(() => {
    setResponse(inputs);
  }, [inputs, setResponse]);

  if (question.type === "BINARY") {
    return (
      <div className="flex flex-col justify-between">
        {[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ].map((item) => (
          <label className="btn group hover:btn-accent w-full inline-flex gap-4 justify-center px-6 has-[:checked]:btn-accent">
            <input
              type="radio"
              name={question.id}
              value={item.value}
              className="hidden peer"
              onChange={(event) => {
                if (event.target.checked) {
                  setInputs([item.value]);
                }
              }}
            />
            <div className="swap peer-checked:swap-active">
              <CircleIcon
                aria-hidden="true"
                className="w-5 h-5 text-gray-600 group-hover:text-current swap-off"
              />
              <CircleDotIcon className="w-5 h-5 text-current swap-on" />
            </div>
            <span className="flex-1">{item.label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "TEXTUAL") {
    return (
      <div className="flex flex-row">
        <div className="card bg-base-100 border border-base-300 rounded-md">
          <div className="card-body flex flex-row">
            <Input
              name="value"
              className="flex-1"
              onChange={(event) => setInputs([event.target.value])}
            />
          </div>
        </div>
      </div>
    );
  }

  if (question.type === "SINGLE") {
    return (
      <div className="flex flex-col gap-2 justify-around">
        {question.choices.map((item) => (
          <label className="btn group hover:btn-accent w-full inline-flex gap-4 justify-center px-6 has-[:checked]:btn-accent">
            <input
              type="radio"
              name={question.id}
              value={item.id}
              className="hidden peer"
              onChange={() => setInputs([item.id])}
            />
            <div className="swap peer-checked:swap-active">
              <CircleIcon
                aria-hidden="true"
                className="w-5 h-5 text-gray-600 group-hover:text-current swap-off"
              />
              <CircleDotIcon className="w-5 h-5 text-current swap-on" />
            </div>
            <span className="flex-1">{item.choice}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "MULTIPLE") {
    return (
      <div className="flex flex-col gap-2 justify-around">
        {question.choices.map((item) => (
          <label className="btn group hover:btn-accent w-full inline-flex gap-4 justify-center px-6 has-[:checked]:btn-accent">
            <input
              type="checkbox"
              name={question.id}
              className="hidden peer"
              value={item.id}
              onChange={(event) => {
                if (event.target.checked) {
                  setInputs((prev) => [...prev, item.id]);
                } else {
                  setInputs((prev) =>
                    prev.filter((input) => input !== item.id)
                  );
                }
              }}
            />
            <span className="swap peer-checked:swap-active">
              <Square
                aria-hidden="true"
                className="w-5 h-5 text-gray-600 group-hover:text-current swap-off"
              />
              <CheckSquare className="w-5 h-5 text-current swap-on" />
            </span>
            <span className="flex-1">{item.choice}</span>
          </label>
        ))}
      </div>
    );
  }
}

export function ContentQuestion(): JSX.Element {
  const { question, setResponse } = useQuizSession();

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="text-accent w-14 h-14 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="card bg-base-100 border border-base-300 rounded-md">
        <div className="card-body">
          <h2 className="text-2xl">{question.question}</h2>
        </div>
      </div>

      <div className="mx-auto max-w-screen-lg w-full">
        <AnswersList question={question} setResponse={setResponse} />
      </div>
    </div>
  );
}
