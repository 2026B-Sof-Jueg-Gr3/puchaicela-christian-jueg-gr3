export type SoundEffect = 'jump' | 'collect' | 'hit';

export class GameAudio {
  private context: AudioContext | null = null;
  private timer = 0;
  private noteIndex = 0;

  start(): void {
    if (this.context) return;
    this.context = new AudioContext();
    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
    this.timer = window.setInterval(() => {
      const note = melody[this.noteIndex % melody.length];
      this.noteIndex += 1;
      this.tone(note, 0.2, 0.028, 'sine');
      if (this.noteIndex % 4 === 0) this.tone(note / 2, 0.25, 0.02, 'triangle');
    }, 250);
  }

  play(effect: SoundEffect): void {
    const sounds: Record<SoundEffect, [number, number, OscillatorType]> = {
      jump: [390, 0.12, 'triangle'],
      collect: [880, 0.18, 'sine'],
      hit: [145, 0.28, 'sawtooth']
    };
    const [frequency, duration, waveform] = sounds[effect];
    this.tone(frequency, duration, 0.09, waveform);
  }

  stop(): void {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
    const context = this.context;
    this.context = null;
    if (context && context.state !== 'closed') void context.close();
  }

  private tone(frequency: number, duration: number, volume: number, waveform: OscillatorType): void {
    const context = this.context;
    if (!context || context.state === 'closed') return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}
