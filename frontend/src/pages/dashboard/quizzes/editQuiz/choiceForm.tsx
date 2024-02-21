import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateQuestionForm } from "./questionForm";
import { FormController } from "#/components/form/FormController";
import { Input } from "#/components/form/Input";
import { Button } from "#/components/form/Button";
import { PlusIcon, TrashIcon, XCircleIcon } from "lucide-react";
import { QuestionType } from "#/api/types";
import { CheckBox } from "#/components/form/Checkbox";
import { Radio } from "#/components/form/Radio";

interface ChoiceFormProps {
  type: QuestionType;
}

export function ChoiceForm({ type }: ChoiceFormProps): JSX.Element {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    trigger,
  } = useFormContext<CreateQuestionForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "choices",
    rules: {
      minLength: 1,
    },
  });

  const setCorrectSingle = (index: number, value: boolean) => {
    for (let i = 0; i < fields.length; i++) {
      setValue(`choices.${i}.correct`, false);
    }
    setValue(`choices.${index}.correct`, value, { shouldValidate: true });
    trigger("choices");
  };

  return (
    <ul className="p-4 border-t border-gray-300 mt-4 flex flex-col gap-4">
      {errors.choices?.root && (
        <div className="alert alert-error">
          <XCircleIcon className="w-4 h-4" />
          {errors.choices?.root.message}
        </div>
      )}

      {fields.map((field, index) => (
        <li key={field.id} className="flex flex-col gap-2">
          <p>Choice {index + 1}</p>
          <div className="flex flex-row items-center gap-2">
            <FormController
              inputId={`choice-text-${index}`}
              className="flex-1 max-w-none"
              errorMessage={errors.choices?.[index]?.choice}
            >
              <Input
                id={`choice-text-${index}`}
                type="text"
                className="max-w-none"
                {...register(`choices.${index}.choice`, {})}
                placeholder={`Choice ${index + 1}`}
                defaultValue={field.choice}
              />
            </FormController>
            <FormController
              inputId={`choice-correct-${index}`}
              className="max-w-none w-24"
              errorMessage={errors.choices?.[index]?.correct}
            >
              {type === "SINGLE" ? (
                <Radio
                  id={`choice-correct-${index}`}
                  onChange={(value) => {
                    setCorrectSingle(index, value.target.checked);
                  }}
                  defaultChecked={field.correct}
                  label={`Correct?`}
                  name="correct-choice"
                  value={index.toString()}
                />
              ) : (
                <CheckBox
                  id={`choice-correct-${index}`}
                  onChange={(value) => {
                    setValue(`choices.${index}.correct`, value.target.checked);
                  }}
                  defaultChecked={field.correct}
                  label={`Correct?`}
                  name="correct-choice"
                />
              )}
            </FormController>
            <Button
              onClick={() => remove(index)}
              className="btn-sm btn-ghost"
              title="Remove"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </li>
      ))}

      <li>
        <Button
          onClick={() => append({ choice: "", correct: false })}
          className="w-full"
        >
          <PlusIcon className="w-4 h-4" />
          Add an answer
        </Button>
      </li>
    </ul>
  );
}
