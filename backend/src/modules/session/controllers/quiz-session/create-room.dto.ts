import {
  IsBoolean,
  IsString,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class SessionPasswordDto {
  @IsBoolean()
  enable: boolean;

  @IsString()
  @MinLength(3)
  @ValidateIf((obj) => obj.enable)
  password: string;
}

class UserCountLimitDto {
  @IsBoolean()
  enable: boolean;

  @IsString()
  @Min(2)
  @ValidateIf((obj) => obj.enable)
  limit: number;
}

/**
 * Data transfer object for creating a quiz session room
 */
export class CreateRoomDto {
  @ValidateNested()
  sessionPassword: SessionPasswordDto;

  @IsBoolean()
  randomizeQuestions: boolean;

  @ValidateNested()
  userCountLimit: UserCountLimitDto;
}
