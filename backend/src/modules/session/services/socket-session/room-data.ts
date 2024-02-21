import { QuestionWithChoices } from 'src/types/quiz';

export class RoomData {
  public hashedPass?: string;
  private _usersLimit?: number;
  public questions: QuestionWithChoices[] = [];
  public started = false;

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
}
