class RetroSounds {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private musicAudio: HTMLAudioElement | null = null;

  private createOscillator(frequency: number, type: OscillatorType, duration: number) {
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

    // Initialize background music
    this.musicAudio = new Audio('/retro-music.mp3');
    this.musicAudio.loop = true;
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
    if (this.musicAudio) {
      this.musicAudio.volume = volume;
    }
  }

  toggleMusic() {
    if (this.musicAudio) {
      if (this.musicAudio.paused) {
        this.musicAudio.play();
      } else {
        this.musicAudio.pause();
      }
    }
  }

  isMusicPlaying() {
    return this.musicAudio && !this.musicAudio.paused;
  }

  typing() {
    this.createOscillator(440, 'square', 0.02);
  }

  searchTyping() {
    this.createOscillator(550, 'sine', 0.02);
  }

  socialTyping() {
    this.createOscillator(660, 'sine', 0.02);
  }

  add() {
    this.createOscillator(660, 'sine', 0.1);
    setTimeout(() => this.createOscillator(880, 'sine', 0.1), 100);
  }

  check() {
    this.createOscillator(880, 'sine', 0.1);
    setTimeout(() => this.createOscillator(1100, 'sine', 0.1), 100);
  }

  uncheck() {
    this.createOscillator(1100, 'sine', 0.1);
    setTimeout(() => this.createOscillator(880, 'sine', 0.1), 100);
  }

  delete() {
    this.createOscillator(220, 'square', 0.1);
    setTimeout(() => this.createOscillator(110, 'square', 0.1), 100);
  }

  moveTask() {
    this.createOscillator(440, 'sine', 0.1);
  }
}

export const retroSounds = new RetroSounds();

