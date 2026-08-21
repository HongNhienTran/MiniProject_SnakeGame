// Web Audio API Synthesizer - 8-Bit Retro Sound Effects & BGM

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private isBgmPlaying: boolean = false;
  private bgmGainNode: GainNode | null = null;
  private currentVolume: number = 0.5;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getBgmGain(): GainNode | null {
    const ctx = this.getContext();
    if (!ctx) return null;
    if (!this.bgmGainNode) {
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.connect(ctx.destination);
    }
    return this.bgmGainNode;
  }

  // UI button click sound effect
  playClick(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Eating food sound effect (Classic Arcade Coin / Powerup Arpeggio)
  playEat(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const noteDuration = 0.04;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + index * noteDuration;
        const endTime = startTime + noteDuration;

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(volume * 0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Turn / direction change sound effect
  playMove(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Game over sound effect (Descending buzzer)
  playGameOver(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const tones = [
        { freq: 440, time: 0 },
        { freq: 370, time: 0.12 },
        { freq: 311, time: 0.24 },
        { freq: 220, time: 0.38 },
      ];

      tones.forEach((tone) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + tone.time;
        const endTime = startTime + 0.14;

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(tone.freq, startTime);
        osc.frequency.linearRampToValueAtTime(tone.freq * 0.85, endTime);

        gain.gain.setValueAtTime(volume * 0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Update BGM Volume in real-time
  setBGMVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.bgmGainNode) {
      try {
        const targetGain = this.isBgmPlaying ? this.currentVolume * 0.15 : 0;
        this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgmGainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  // Background music (Instant, responsive Chiptune loop)
  startBGM(volume: number = 0.5) {
    this.currentVolume = Math.max(0, Math.min(1, volume));

    // Clear any previous interval immediately
    this.stopBGM();

    const ctx = this.getContext();
    const bgmGain = this.getBgmGain();
    if (!ctx || !bgmGain) return;

    this.isBgmPlaying = true;
    bgmGain.gain.cancelScheduledValues(ctx.currentTime);
    bgmGain.gain.setValueAtTime(this.currentVolume * 0.15, ctx.currentTime);

    const baseNotes = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
    let noteIndex = 0;

    const playNextBeat = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGainNode) return;
      try {
        const freq = baseNotes[noteIndex % baseNotes.length];
        noteIndex++;

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        noteGain.gain.setValueAtTime(1.0, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

        osc.connect(noteGain);
        noteGain.connect(bgmGain);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } catch (e) {}
    };

    playNextBeat();
    this.bgmInterval = setInterval(playNextBeat, 260);
  }

  // Instantly cut and silence BGM
  stopBGM() {
    this.isBgmPlaying = false;

    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }

    if (this.ctx && this.bgmGainNode) {
      try {
        this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgmGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  getBgmStatus(): boolean {
    return this.isBgmPlaying;
  }
}

export const soundManager = new SoundManager();
