// Every sound is synthesized with the Web Audio API: no audio files.
// Phaser's own sound manager is disabled (config `audio.noAudio`), this is the only AudioContext.
import type { SfxKey } from '../sim/types.ts';

/** Minimum gap (s) between two plays of the same sound, so mass kills don't saturate. */
const GAP: Partial<Record<SfxKey, number>> = { shot: 0.08, boom: 0.06, hit: 0.14, erasekill: 0.05 };

export class Synth {
  muted = false;
  private ac: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private beamGain: GainNode | null = null;
  private last: Partial<Record<SfxKey, number>> = {};

  /** Must run inside a user gesture (browser autoplay rules). */
  init() {
    if (this.ac) { if (this.ac.state === 'suspended') void this.ac.resume(); return; }
    try {
      const ac = new AudioContext();
      const len = ac.sampleRate * 0.6;
      this.noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // Cosmic Beam drone: always running, gated by beamGain
      const o = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter();
      this.beamGain = ac.createGain();
      this.beamGain.gain.value = 0;
      o.type = 'sawtooth'; o.frequency.value = 82;
      o2.type = 'square'; o2.frequency.value = 164.5;
      f.type = 'lowpass'; f.frequency.value = 900;
      o.connect(f); o2.connect(f); f.connect(this.beamGain).connect(ac.destination);
      o.start(); o2.start();
      this.ac = ac;
    } catch {
      this.ac = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.setBeam(false);
    return this.muted;
  }

  setBeam(on: boolean) {
    if (this.beamGain) this.beamGain.gain.value = on && !this.muted ? 0.025 : 0;
  }

  play(k: SfxKey) {
    const ac = this.ac;
    if (!ac || this.muted) return;
    const now = ac.currentTime, gap = GAP[k] ?? 0, prev = this.last[k];
    if (prev !== undefined && now - prev < gap) return;
    this.last[k] = now;
    switch (k) {
      case 'shot': this.tone(880, 520, 0.05, 'square', 0.01); break;
      case 'boom': this.noise(0.25, 0.14, 900); break;
      case 'big': this.noise(1, 0.32, 500); this.tone(120, 35, 0.9, 'sawtooth', 0.08); break;
      case 'erase': this.tone(1800, 50, 0.7, 'sawtooth', 0.06); this.noise(0.5, 0.18, 3500); break;
      case 'tp': this.tone(260, 1500, 0.16, 'triangle', 0.08); break;
      case 'hit': this.tone(170, 70, 0.12, 'square', 0.05); break;
      case 'lvl':
        this.tone(520, 1040, 0.12, 'triangle', 0.07);
        this.tone(780, 1560, 0.16, 'triangle', 0.07, 0.09);
        break;
      case 'boss': this.tone(110, 55, 1.3, 'sawtooth', 0.09); this.tone(116, 58, 1.3, 'sawtooth', 0.07); break;
      case 'zap': this.noise(0.18, 0.2, 5000); this.tone(1200, 200, 0.18, 'square', 0.04); break;
      case 'erasekill': break; // throttled slot only; the erase sweep covers it
    }
  }

  /** Oscillator with an exponential pitch and volume sweep. */
  private tone(f1: number, f2: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
    const ac = this.ac!, t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** Low-passed white noise burst. */
  private noise(dur: number, vol: number, freq: number) {
    const ac = this.ac!, t = ac.currentTime, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = this.noiseBuf;
    f.type = 'lowpass';
    f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(ac.destination);
    src.start(t);
    src.stop(t + dur);
  }
}
