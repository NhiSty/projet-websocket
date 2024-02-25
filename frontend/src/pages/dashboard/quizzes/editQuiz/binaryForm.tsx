import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateQuestionForm } from "./questionForm";
import { FormController } from "#/components/form/FormController";
import { XCircleIcon } from "lucide-react";
import { Radio } from "#/components/form/Radio";

export function BinaryForm(): JSX.Element | null {
  const {
    control,
    formState: { errors },
    setValue,
    trigger,
  } = useFormContext<CreateQuestionForm>();
  const { fields } = useFieldArray({
    control,
    name: "choices",
    rules: {
      minLength: 1,
      maxLength: 2,
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
    <section className="p-4 border-t border-gray-300 mt-4 flex flex-col gap-4">
      {errors.choices?.root && (
        <div className="alert alert-error">
          <XCircleIcon className="w-4 h-4" />
          {errors.choices?.root.message}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p>Valid value</p>
        <div className="flex flex-row items-center gap-2">
          {fields.map((field, index) => (
            <FormController
              key={field.choice}
              inputId={`choice-correct-${index}`}
              className="max-w-none w-24"
              errorMessage={errors.choices?.[index]?.correct}
            >
              <Radio
                id={`choice-correct-${index}`}
                onChange={(value) => {
                  setCorrectSingle(index, value.target.checked);
                }}
                defaultChecked={field.correct}
                label={field.choice}
                name="correct-choice"
                value={index.toString()}
              />
            </FormController>
          ))}
        </div>
      </div>
    </section>
  );
}
