// Keyboard, mouse, touch joystick and the mobile DOM buttons, turned into a SimInput.
import Phaser from 'phaser';
import type { SimInput } from '../sim/types.ts';
import { H, W } from '../sim/util.ts';

export interface ControlHandlers {
  /** Gameplay keys only act while a run is active. */
  isRunning(): boolean;
  isChoosing(): boolean;
  onPause(): void;
  onMute(): void;
  onChoose(i: number): void;
  onBlur(): void;
  onTouchMode(): void;
}

const JOY_RADIUS = 28;
const PREVENT = new Set([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift']);

export class Controls {
  readonly input: SimInput = { moveX: 0, moveY: 0, aimX: W / 2 + 60, aimY: H / 2, touch: false, beam: false, erase: false, tp: false, time: false };
  readonly mouse = { x: W / 2 + 60, y: H / 2, down: false };
  joy: { id: number; ox: number; oy: number; x: number; y: number } | null = null;
  touch = false;
  private keys: Record<string, boolean> = {};
  private beamHeld = false;
  private h: ControlHandlers;

  constructor(scene: Phaser.Scene, h: ControlHandlers) {
    this.h = h;
    const kb = scene.input.keyboard!;
    kb.on('keydown', (e: KeyboardEvent) => this.keyDown(e));
    kb.on('keyup', (e: KeyboardEvent) => { this.keys[e.key.toLowerCase()] = false; });
    scene.game.events.on(Phaser.Core.Events.BLUR, () => {
      for (const k in this.keys) this.keys[k] = false;
      this.mouse.down = false;
      h.onBlur();
    });

    scene.input.addPointer(2);
    scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.wasTouch) {
        this.setTouch();
        if (p.x < W * 0.6 && !this.joy) this.joy = { id: p.id, ox: p.x, oy: p.y, x: p.x, y: p.y };
        return;
      }
      this.mouse.x = p.x;
      this.mouse.y = p.y;
      if (p.rightButtonDown()) { if (h.isRunning()) this.input.tp = true; }
      else this.mouse.down = true;
    });
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.joy && p.id === this.joy.id) { this.joy.x = p.x; this.joy.y = p.y; return; }
      if (!p.wasTouch) { this.mouse.x = p.x; this.mouse.y = p.y; }
    });
    const end = (p: Phaser.Input.Pointer) => {
      if (this.joy && p.id === this.joy.id) this.joy = null;
      if (!p.wasTouch && p.button !== 2) this.mouse.down = false;
    };
    scene.input.on('pointerup', end);
    scene.input.on('pointerupoutside', end);

    this.hold('mBeam', () => this.setBeamHeld(true), () => this.setBeamHeld(false));
    this.hold('mErase', () => { if (h.isRunning()) this.input.erase = true; });
    this.hold('mTp', () => { if (h.isRunning()) this.input.tp = true; });
    this.hold('mTime', () => { if (h.isRunning()) this.input.time = true; });

    if (matchMedia('(pointer:coarse)').matches && !matchMedia('(pointer:fine)').matches) this.setTouch();
  }

  private setBeamHeld(on: boolean) {
    this.beamHeld = on;
    document.getElementById('mBeam')!.classList.toggle('on', on);
  }

  private keyDown(e: KeyboardEvent) {
    const k = e.key.toLowerCase(), h = this.h, running = h.isRunning();
    if (PREVENT.has(k) && running) e.preventDefault();
    if (!this.keys[k]) {
      if (h.isChoosing()) {
        if (k === '1' || k === '2' || k === '3') { h.onChoose(+k - 1); e.preventDefault(); }
        this.keys[k] = true;
        return;
      }
      if ((k === ' ' || k === 'e') && running) this.input.erase = true;
      if ((k === 'shift' || k === 'l') && running) this.input.tp = true;
      if (k === 'q' && running) this.input.time = true;
      if (k === 'p' || k === 'escape') h.onPause();
      if (k === 'm') h.onMute();
    }
    this.keys[k] = true;
  }

  private hold(id: string, on: () => void, off?: () => void) {
    const el = document.getElementById(id)!;
    el.addEventListener('pointerdown', e => { e.preventDefault(); on(); });
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(t, () => off?.());
  }

  private setTouch() {
    if (this.touch) return;
    this.touch = true;
    this.h.onTouchMode();
  }

  /** Drop held inputs (used when the evolution screen opens). */
  releaseHolds() {
    this.mouse.down = false;
    this.setBeamHeld(false);
  }

  /** Refresh the continuous part of the input. One-shot flags stay set until the sim consumes them. */
  sample(): SimInput {
    const k = this.keys, inp = this.input;
    let mx = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0);
    let my = (k.s || k.arrowdown ? 1 : 0) - (k.w || k.arrowup ? 1 : 0);
    if (this.joy) {
      mx = (this.joy.x - this.joy.ox) / JOY_RADIUS;
      my = (this.joy.y - this.joy.oy) / JOY_RADIUS;
    }
    const m = Math.hypot(mx, my);
    if (m > 1) { mx /= m; my /= m; }
    inp.moveX = mx;
    inp.moveY = my;
    inp.aimX = this.mouse.x;
    inp.aimY = this.mouse.y;
    inp.touch = this.touch;
    inp.beam = this.mouse.down || !!k.j || this.beamHeld;
    return inp;
  }

  /** Clear queued one-shots (new run). */
  reset() {
    this.input.erase = this.input.tp = this.input.time = false;
    this.releaseHolds();
  }
}
