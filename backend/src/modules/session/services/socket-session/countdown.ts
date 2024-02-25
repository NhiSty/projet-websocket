export class Countdown {
  private intervalId: NodeJS.Timeout;

  public constructor(
    private counter: number,
    private callback: (count: number) => void,
  ) {}

  public start(): void {
    this.intervalId = setInterval(() => {
      if (this.counter >= 0) {
        // Emit count
        this.callback(this.counter);
      } else {
        clearTimeout(this.intervalId);
      }
      this.counter--;
    }, 1000);
  }

  public stop() {
    clearInterval(this.intervalId);
  }

  public get count() {
    return this.counter;
  }

  public set count(value: number) {
    this.counter = value > 0 ? value : 0;
  }
}
