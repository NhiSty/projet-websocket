import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';

class ChoiceDto {
  @IsString()
  id: string;

  @IsString()
  choice: string;

  @IsString()
  correct: boolean;
}

/**
 * Data transfer object for creating a quiz
 */
export class UpdateQuestionDto {
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

  /**
   * The choices of the question
   */
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2)
  @Type(() => ChoiceDto)
  choices: ChoiceDto[];
}
