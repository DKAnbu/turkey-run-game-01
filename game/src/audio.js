// Audio synthesis engine for Gobble's Great Escape
// Uses procedural Web Audio API with zero external assets or network requests

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch {
      this.initialized = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  gobble() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const startTime = t + i * 0.055;
      const freq = 420 + (i % 2 === 0 ? 80 : -40) + Math.random() * 40;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, startTime + 0.05);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.055);
    }
  }

  jump() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.16);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  flutter() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.06);
    osc.frequency.linearRampToValueAtTime(120, t + 0.12);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  collectCorn() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.14, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.1);
    });
  }

  collectPowerup() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.12);
    });
  }

  dash() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 0.15);
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  knifeWhoosh() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  hit() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  victory() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const fanfares = [
      { f: 440.00, d: 0.15, delay: 0.00 },
      { f: 554.37, d: 0.15, delay: 0.16 },
      { f: 659.25, d: 0.20, delay: 0.32 },
      { f: 880.00, d: 0.45, delay: 0.54 }
    ];
    fanfares.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.delay);
      gain.gain.setValueAtTime(0.16, t + note.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.delay + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + note.delay);
      osc.stop(t + note.delay + note.d);
    });
  }

  caught() {
    if (this.muted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const gloom = [
      { f: 220, delay: 0.0 },
      { f: 207.65, delay: 0.22 },
      { f: 196.00, delay: 0.44 },
      { f: 146.83, delay: 0.68 }
    ];
    gloom.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, t + note.delay);
      gain.gain.setValueAtTime(0.15, t + note.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.delay + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + note.delay);
      osc.stop(t + note.delay + 0.35);
    });
  }
}

export const sounds = new SoundFX();
