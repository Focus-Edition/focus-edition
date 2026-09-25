export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerListener {
  onTick?: (remainingSeconds: number, formatted: string, progressPct: number) => void;
  onComplete?: () => void;
  onBreakReminder?: () => void;
}

export class FocusTimer {
  private totalSeconds: number;
  private remainingSeconds: number;
  private state: TimerState = 'idle';
  private timerId: any = null;
  private listeners: Set<TimerListener> = new Set();

  constructor(defaultMinutes: number = 25) {
    this.totalSeconds = defaultMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
  }

  public subscribe(listener: TimerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): TimerState {
    return this.state;
  }

  public getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  public getFormattedTime(): string {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  public getProgressPercentage(): number {
    if (this.totalSeconds === 0) return 100;
    const elapsed = this.totalSeconds - this.remainingSeconds;
    return Math.min(100, Math.round((elapsed / this.totalSeconds) * 100));
  }

  public setDuration(minutes: number): void {
    this.pause();
    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.state = 'idle';
    this.notifyTick();
  }

  public start(minutes?: number): void {
    if (minutes !== undefined) {
      this.totalSeconds = minutes * 60;
      this.remainingSeconds = this.totalSeconds;
    }

    if (this.state === 'running') {
      return;
    }

    this.state = 'running';
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);

    this.notifyTick();
  }

  public pause(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.state === 'running') {
      this.state = 'paused';
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      this.start();
    }
  }

  public reset(): void {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.state = 'idle';
    this.notifyTick();
  }

  public tick(): void {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
      this.notifyTick();
    }

    if (this.remainingSeconds <= 0) {
      this.pause();
      this.state = 'completed';
      this.listeners.forEach(l => {
        if (l.onComplete) l.onComplete();
        if (l.onBreakReminder) l.onBreakReminder();
      });
    }
  }

  private notifyTick(): void {
    const formatted = this.getFormattedTime();
    const pct = this.getProgressPercentage();
    this.listeners.forEach(l => {
      if (l.onTick) l.onTick(this.remainingSeconds, formatted, pct);
    });
  }

  public destroy(): void {
    this.pause();
    this.listeners.clear();
  }
}
