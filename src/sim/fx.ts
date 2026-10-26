// Cosmetic effects stored in sim state. Always use fxRnd here, never sim.rnd.
import type { Sim } from './Sim.ts';
import type { Color } from './types.ts';
import { compact, fxRnd, TAU } from './util.ts';

const MAX_PARTICLES = 1400;

export function part(sim: Sim, x: number, y: number, vx: number, vy: number, life: number, col: Color, s = 1, add = true) {
  const parts = sim.s.fx.parts;
  if (parts.length > MAX_PARTICLES) return;
  parts.push({ x, y, vx, vy, life, max: life, col, s, add });
}

export function boom(sim: Sim, x: number, y: number, n: number, cols: readonly Color[]) {
  for (let i = 0; i < n; i++) {
    const a = fxRnd() * TAU, v = 20 + fxRnd() * 90;
    part(sim, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.3 + fxRnd() * 0.5, cols[(fxRnd() * cols.length) | 0], fxRnd() < 0.3 ? 2 : 1);
  }
}

export function floatText(sim: Sim, x: number, y: number, txt: string, col: Color) {
  sim.s.fx.texts.push({ x, y, txt, col, life: 1.1 });
}

export function shockRing(sim: Sim, x: number, y: number, dur: number, max: number, inner = 0, small = true) {
  sim.s.fx.rings.push({ x, y, t: 0, dur, max, inner, small });
}

export function updateFx(sim: Sim, dt: number) {
  const s = sim.s, fx = s.fx;
  for (const t of fx.texts) { t.life -= dt; t.y -= 14 * dt; }
  compact(fx.texts, t => t.life > 0);
  for (const p of fx.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; }
  compact(fx.parts, p => p.life > 0);
  for (const r of fx.rings) r.t += dt;
  compact(fx.rings, r => r.t < r.dur);
  for (const g of fx.ghosts) g.life -= dt;
  compact(fx.ghosts, g => g.life > 0);
  s.shake = Math.max(0, s.shake - dt * 25);
  s.invert = Math.max(0, s.invert - dt);
}
