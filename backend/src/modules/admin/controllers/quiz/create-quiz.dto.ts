import { IsOptional, IsString } from 'class-validator';

/**
 * Data transfer object for creating a quiz
 */
export class CreateQuizDto {
  /**
   * The name of the quiz
   */
  @IsString()
  @IsOptional()
  name?: string;
}
