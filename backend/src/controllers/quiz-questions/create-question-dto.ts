import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { QuestionType } from '@prisma/client';

/**
 * Data transfer object for creating a quiz
 */
export class CreateQuestionDto {
  /**
   * The name of the quiz
   */
  @IsString()
  name: string;

  /**
   * The type of the quiz
   */
  @IsEnum(QuestionType)
  type: QuestionType;

  /**
   * The question duration type
   */
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  @Min(0)
  @Max(60)
  duration: number;
}
