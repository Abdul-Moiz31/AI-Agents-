export class Semaphore {
  private active = 0;

  constructor(private readonly max: number) {}

  async acquire(): Promise<() => void> {
    while (this.active >= this.max) {
      await new Promise((r) => setTimeout(r, 25));
    }
    this.active += 1;
    return () => {
      this.active = Math.max(0, this.active - 1);
    };
  }
}
