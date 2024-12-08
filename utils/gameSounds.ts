class GameSounds {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  private createSound(frequency: number, type: OscillatorType, duration: number) {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.connect(this.gainNode);
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  init() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  completeTask() {
    this.createSound(440, 'square', 0.1);
    setTimeout(() => this.createSound(880, 'square', 0.1), 100);
  }

  unlockAchievement() {
    this.createSound(523.25, 'sine', 0.1);
    setTimeout(() => this.createSound(659.25, 'sine', 0.1), 100);
    setTimeout(() => this.createSound(783.99, 'sine', 0.1), 200);
  }

  error() {
    this.createSound(220, 'sawtooth', 0.2);
  }
}

export const gameSounds = new GameSounds();

