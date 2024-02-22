import { Quiz } from '@prisma/client';
import { QuestionWithChoices } from 'src/types/quiz';
import { Countdown } from './countdown';

export enum RoomStatus {
  PENDING = 'pending',
  STARTED = 'started',
  ENDED = 'ended',
}

export class RoomData {
  public hashedPass?: string;
  private _usersLimit?: number;
  public questions: QuestionWithChoices[] = [];
  public status: RoomStatus = RoomStatus.PENDING;
  public quiz: Quiz;
  public questionIndex = 0;
  public countDown?: Countdown;

  public set userLimit(limit: number) {
    this._usersLimit = limit > 0 ? limit : undefined;
  }

  public get userLimit() {
    return this._usersLimit;
  }

  public randomizeQuestions() {
    this.questions = this.shuffle(this.questions);
  }

  private shuffle(array: QuestionWithChoices[]) {
    let currentIndex = array.length;
    let temporaryValue: QuestionWithChoices;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  public nextQuestion(): QuestionWithChoices {
    return this.questions[this.questionIndex++];
  }
}
