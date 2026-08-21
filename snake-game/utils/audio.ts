// Web Audio API Synthesizer - 8-Bit Retro Sound Effects & BGM

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private isBgmPlaying: boolean = false;

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

  // Âm thanh click nút UI
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

  // Âm thanh khi Rắn ăn mồi (Classic Arcade Coin / Powerup Arpeggio)
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

  // Âm thanh chuyển hướng (Move / Tick nhẹ nhàng)
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

  // Âm thanh khi Game Over (Buzzer giảm dần)
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

  // Âm thanh chiến thắng / điểm cao
  playHighScore(volume: number = 0.5) {
    if (volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.1 },
        { f: 659.25, d: 0.1 },
        { f: 783.99, d: 0.1 },
        { f: 1046.5, d: 0.25 },
      ];
      let offset = 0;
      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + offset;
        const end = start + note.d;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(note.f, start);

        gain.gain.setValueAtTime(volume * 0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.001, end);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(end);
        offset += note.d * 0.9;
      });
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Nhạc nền Retro 8-bit BGM (Chiptune loop)
  startBGM(volume: number = 0.3) {
    if (this.isBgmPlaying || volume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    const baseNotes = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
    let noteIndex = 0;

    const playNextBeat = () => {
      if (!this.isBgmPlaying) return;
      try {
        const freq = baseNotes[noteIndex % baseNotes.length];
        noteIndex++;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume * 0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } catch (e) {}
    };

    playNextBeat();
    this.bgmInterval = setInterval(playNextBeat, 260);
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  getBgmStatus() {
    return this.isBgmPlaying;
  }
}

export const soundManager = new SoundManager();
