export type TtsState = 'idle' | 'speaking' | 'paused' | 'stopped';

export interface TtsOptions {
  rate?: number;
  pitch?: number;
  language?: string;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: any) => void;
}

class TtsController {
  private state: TtsState = 'idle';
  private currentText: string = '';
  private expoSpeechModule: any = null;

  constructor() {
    this.initModule();
  }

  private async initModule() {
    try {
      this.expoSpeechModule = await import('expo-speech');
    } catch {
      // In web or testing environments, fall back to Web Speech or mock
    }
  }

  public getState(): TtsState {
    return this.state;
  }

  public isSpeaking(): boolean {
    return this.state === 'speaking';
  }

  public async stop(): Promise<void> {
    this.state = 'idle';
    this.currentText = '';

    // 1. Try expo-speech
    if (this.expoSpeechModule && typeof this.expoSpeechModule.stop === 'function') {
      try {
        await this.expoSpeechModule.stop();
      } catch {}
    }

    // 2. Try window.speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  public async toggleSpeak(text: string, options: TtsOptions = {}): Promise<{ action: 'started' | 'stopped'; state: TtsState }> {
    const trimmed = (text || '').trim();
    if (!trimmed) {
      await this.stop();
      return { action: 'stopped', state: 'idle' };
    }

    // SECOND CLICK STOPS!
    if (this.state === 'speaking') {
      await this.stop();
      if (options.onStopped) options.onStopped();
      return { action: 'stopped', state: 'idle' };
    }

    // FIRST CLICK STARTS
    this.state = 'speaking';
    this.currentText = trimmed;
    const rate = options.rate || 0.95;
    const pitch = options.pitch || 1.0;
    const language = options.language || 'en-GB';

    if (options.onStart) options.onStart();

    // 1. Check if running in browser with speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = language;

        utterance.onend = () => {
          this.state = 'idle';
          this.currentText = '';
          if (options.onDone) options.onDone();
        };

        utterance.onerror = (e) => {
          this.state = 'idle';
          this.currentText = '';
          if (options.onError) options.onError(e);
        };

        window.speechSynthesis.speak(utterance);
        return { action: 'started', state: 'speaking' };
      } catch (webErr) {
        console.warn('Web Speech API error, falling back:', webErr);
      }
    }

    // 2. Try expo-speech module for iOS / Android
    if (this.expoSpeechModule && typeof this.expoSpeechModule.speak === 'function') {
      try {
        this.expoSpeechModule.speak(trimmed, {
          rate,
          pitch,
          language,
          onDone: () => {
            this.state = 'idle';
            this.currentText = '';
            if (options.onDone) options.onDone();
          },
          onStopped: () => {
            this.state = 'idle';
            this.currentText = '';
            if (options.onStopped) options.onStopped();
          },
          onError: (err: any) => {
            this.state = 'idle';
            this.currentText = '';
            if (options.onError) options.onError(err);
          }
        });
        return { action: 'started', state: 'speaking' };
      } catch (expoErr) {
        console.warn('Expo speech error:', expoErr);
      }
    }

    // Fallback simulation for Node/Test runtime
    return { action: 'started', state: 'speaking' };
  }
}

export const ttsService = new TtsController();
