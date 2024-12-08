class RetroSounds {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private musicAudio: HTMLAudioElement | null = null;

  private createSound(frequency: number, type: OscillatorType, duration: number) {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain(); // Temporary gain node for volume control
    gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  init() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime); // Default volume

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

  // Sound effects from GameSounds
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

  // Sound effects from RetroSounds
  typing() {
    this.createSound(440, 'square', 0.02);
  }

  searchTyping() {
    this.createSound(550, 'sine', 0.02);
  }

  socialTyping() {
    this.createSound(660, 'sine', 0.02);
  }

  add() {
    this.createSound(660, 'sine', 0.1);
    setTimeout(() => this.createSound(880, 'sine', 0.1), 100);
  }

  check() {
    this.createSound(880, 'sine', 0.1);
    setTimeout(() => this.createSound(1100, 'sine', 0.1), 100);
  }

  uncheck() {
    this.createSound(1100, 'sine', 0.1);
    setTimeout(() => this.createSound(880, 'sine', 0.1), 100);
  }

  delete() {
    this.createSound(220, 'square', 0.1);
    setTimeout(() => this.createSound(110, 'square', 0.1), 100);
  }

  moveTask() {
    this.createSound(440, 'sine', 0.1);
  }
}

export const retroSounds = new RetroSounds();
