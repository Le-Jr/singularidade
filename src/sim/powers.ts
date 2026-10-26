// Omega's powers: bolts, beam, erase, teleport, time stop, clones, falling stars.
import { hurt, kill } from './combat.ts';
import { boom, floatText, part, shockRing } from './fx.ts';
import type { Sim } from './Sim.ts';
import type { Enemy, GameState, SimInput } from './types.ts';
import { clamp, compact, dist, fxRnd, H, segDist, TAU, W } from './util.ts';

export const BEAM_LEN = 480;
export const STRIKE_WARN = 0.45;

export function nearestEnemy(sim: Sim, x: number, y: number): Enemy | null {
  let best: Enemy | null = null, bd = 1e9;
  for (const e of sim.s.enemies) {
    if (e.dead) continue;
    const d = dist(x, y, e.x, e.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

/** Touch auto-aims at the nearest enemy; desktop aims at the pointer. */
export function aimAngle(sim: Sim, input: SimInput): number {
  const P = sim.s.P;
  if (input.touch) {
    const e = nearestEnemy(sim, P.x, P.y);
    return e ? Math.atan2(e.y - P.y, e.x - P.x) : P.aim;
  }
  return Math.atan2(input.aimY - P.y, input.aimX - P.x);
}

export function clonePos(s: GameState, i: number): [number, number] {
  const a = s.t * 1.6 + (i * TAU) / s.up.clones;
  return [s.P.x + Math.cos(a) * 24, s.P.y + Math.sin(a) * 16];
}

export function doErase(sim: Sim) {
  const s = sim.s, P = s.P;
  if (P.erCd > 0 || P.dead) return;
  P.erCd = s.up.eraseCd;
  s.invert = 0.09;
  s.shake = 7;
  sim.sfx('erase');
  const rIn = 65 * s.up.eraseR, rOut = 120 * s.up.eraseR;
  shockRing(sim, P.x, P.y, 0.38, rOut, rIn, false);
  let n = 0;
  for (const e of s.enemies) {
    if (e.dead) continue;
    const d = dist(P.x, P.y, e.x, e.y);
    if (e.boss) { if (d < rOut + 10) hurt(sim, e, 700 * s.dmgMult); }
    else if (d < rIn) { kill(sim, e, 'erase'); n++; }
    else if (d < rOut) hurt(sim, e, 320 * s.dmgMult);
  }
  compact(s.bullets, b => {
    if (dist(P.x, P.y, b.x, b.y) < rOut) { part(sim, b.x, b.y, 0, -12, 0.4, 0xffffff); return false; }
    return true;
  });
  if (n) floatText(sim, P.x, P.y - 20, n + ' APAGADO' + (n > 1 ? 'S' : ''), 0xffffff);
}

export function doTp(sim: Sim, input: SimInput) {
  const s = sim.s, P = s.P;
  if (P.tpCd > 0 || P.dead) return;
  let a: number, len: number;
  if (input.touch) {
    const m = Math.hypot(P.mx, P.my);
    a = m > 0.1 ? Math.atan2(P.my, P.mx) : P.aim;
    len = 110;
  } else {
    a = Math.atan2(input.aimY - P.y, input.aimX - P.x);
    len = Math.min(150, dist(P.x, P.y, input.aimX, input.aimY));
  }
  s.fx.ghosts.push({ x: P.x, y: P.y, life: 0.45 });
  for (let i = 0; i < 14; i++) part(sim, P.x, P.y, (fxRnd() - 0.5) * 50, (fxRnd() - 0.5) * 50, 0.4, 0xffe9a8);
  P.x = clamp(P.x + Math.cos(a) * len, 8, W - 8);
  P.y = clamp(P.y + Math.sin(a) * len, 10, H - 10);
  P.inv = 0.45;
  P.tpCd = s.up.tpCd;
  sim.sfx('tp');
  const bl = s.up.tpBlast;
  shockRing(sim, P.x, P.y, 0.25, bl);
  for (const e of s.enemies) if (!e.dead && dist(P.x, P.y, e.x, e.y) < bl + e.r) hurt(sim, e, 160 * s.dmgMult);
  compact(s.bullets, b => dist(P.x, P.y, b.x, b.y) > bl * 0.6);
}

export function doTime(sim: Sim) {
  const s = sim.s;
  if (s.up.time <= 0 || s.tsCd > 0 || s.P.dead) return;
  s.freeze = 1.5 + 1.5 * s.up.time;
  s.tsCd = s.tsMax;
  s.invert = 0.06;
  sim.sfx('boss');
  shockRing(sim, s.P.x, s.P.y, 0.5, 260);
  sim.banner('Tempo parado', '', 1);
}

export function updateClones(sim: Sim, dt: number) {
  const s = sim.s;
  if (s.up.clones <= 0 || (s.cloneT -= dt) > 0) return;
  s.cloneT = 0.24;
  for (let i = 0; i < s.up.clones; i++) {
    const [cx, cy] = clonePos(s, i), t = nearestEnemy(sim, cx, cy);
    if (!t) break;
    const a = Math.atan2(t.y - cy, t.x - cx);
    s.shots.push({ x: cx, y: cy, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, life: 1.2, dmg: 6 * s.dmgMult });
  }
}

export function updateStrikes(sim: Sim, dt: number) {
  const s = sim.s;
  if (s.up.meteor > 0 && (s.meteorT -= dt) <= 0) {
    s.meteorT = Math.max(0.8, 3.4 - s.up.meteor * 0.65);
    const alive = s.enemies.filter(e => !e.dead);
    if (alive.length) {
      const e = alive[(sim.rnd() * alive.length) | 0];
      s.strikes.push({ x: e.x, y: e.y, t: STRIKE_WARN, done: false });
    }
  }
  for (const st of s.strikes) {
    st.t -= dt;
    if (st.t > 0 || st.done) continue;
    st.done = true;
    s.shake = Math.max(s.shake, 4);
    sim.sfx('boom');
    boom(sim, st.x, st.y, 26, [0xfff6d6, 0xffd25e, 0x9be8ff]);
    for (const e of s.enemies) if (!e.dead && dist(st.x, st.y, e.x, e.y) < 22 + e.r) hurt(sim, e, 260 * s.dmgMult);
    compact(s.bullets, b => dist(st.x, st.y, b.x, b.y) > 22);
  }
  compact(s.strikes, st => !st.done);
}

/** Bolts when not beaming, Cosmic Beam while held. */
export function updateAttacks(sim: Sim, dt: number) {
  const s = sim.s, P = s.P;
  const ca = Math.cos(P.aim), sa = Math.sin(P.aim);
  if (!P.beaming) {
    if ((s.shotT -= dt) <= 0) {
      s.shotT = 0.085;
      const nb = s.up.bolts;
      for (let bi = 0; bi < nb; bi++) {
        const a = P.aim + (bi - (nb - 1) / 2) * 0.12 + (sim.rnd() - 0.5) * 0.04;
        s.shots.push({ x: P.x + ca * 6, y: P.y + sa * 6, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, life: 1.3, dmg: 7 * s.dmgMult });
      }
      sim.sfx('shot');
    }
    return;
  }
  const x2 = P.x + ca * BEAM_LEN, y2 = P.y + sa * BEAM_LEN;
  for (const e of s.enemies) {
    if (!e.dead && segDist(e.x, e.y, P.x, P.y, x2, y2) < e.r + 4 * s.up.beamW) {
      hurt(sim, e, 170 * s.up.beamDmg * s.dmgMult * dt, true);
      if (fxRnd() < 0.25) part(sim, e.x, e.y, (fxRnd() - 0.5) * 50, (fxRnd() - 0.5) * 50, 0.25, 0xfff3c0);
    }
  }
  compact(s.bullets, b => {
    if (segDist(b.x, b.y, P.x, P.y, x2, y2) < 5 * s.up.beamW) {
      if (fxRnd() < 0.5) part(sim, b.x, b.y, (fxRnd() - 0.5) * 30, (fxRnd() - 0.5) * 30, 0.2, 0xffe9a8);
      return false;
    }
    return true;
  });
  if (fxRnd() < 0.7) {
    const k = fxRnd() * 300;
    part(sim, P.x + ca * k, P.y + sa * k, (fxRnd() - 0.5) * 20, (fxRnd() - 0.5) * 20, 0.25, 0xffd25e);
  }
}

export function updateShots(sim: Sim, dt: number) {
  const s = sim.s;
  for (const sh of s.shots) {
    sh.x += sh.vx * dt;
    sh.y += sh.vy * dt;
    sh.life -= dt;
    if (sh.x < -5 || sh.x > W + 5 || sh.y < -5 || sh.y > H + 5) sh.life = 0;
    if (sh.life <= 0) continue;
    for (const e of s.enemies) {
      if (!e.dead && Math.abs(e.x - sh.x) < e.r + 3 && Math.abs(e.y - sh.y) < e.r + 3) {
        hurt(sim, e, sh.dmg);
        sh.life = 0;
        break;
      }
    }
  }
  compact(s.shots, sh => sh.life > 0);
}
