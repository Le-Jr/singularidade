// Damage, kills, XP and enemy bullet helpers.
import { bossDown } from './bosses.ts';
import { boom, floatText, part, shockRing } from './fx.ts';
import type { Sim } from './Sim.ts';
import { bScale, dmScale, xpToNext } from './state.ts';
import type { Color, Enemy } from './types.ts';
import { fxRnd, TAU } from './util.ts';
import { queueUpgrade } from './upgrades.ts';

const MAX_BULLETS = 950;

export function shoot(sim: Sim, x: number, y: number, a: number, spd: number, r: number, col: Color, dmg: number) {
  const s = sim.s;
  if (s.bullets.length > MAX_BULLETS) return;
  const k = spd * bScale(s);
  s.bullets.push({ x, y, vx: Math.cos(a) * k, vy: Math.sin(a) * k, r, col, dmg: dmg * dmScale(s), dead: false });
}

export function ring(sim: Sim, x: number, y: number, n: number, spd: number, r: number, col: Color, dmg: number, off: number) {
  for (let i = 0; i < n; i++) shoot(sim, x, y, off + (i * TAU) / n, spd, r, col, dmg);
}

export function fan(sim: Sim, x: number, y: number, a: number, n: number, spread: number, spd: number, r: number, col: Color, dmg: number) {
  for (let i = 0; i < n; i++) shoot(sim, x, y, a + (i - (n - 1) / 2) * spread, spd, r, col, dmg);
}

/** Damage an enemy. `quiet` skips the hit spark (used by continuous damage). */
export function hurt(sim: Sim, e: Enemy, amt: number, quiet = false) {
  if (e.dead) return;
  e.hp -= amt;
  e.flash = 0.06;
  if (!quiet && fxRnd() < 0.3) part(sim, e.x, e.y, (fxRnd() - 0.5) * 60, (fxRnd() - 0.5) * 60, 0.2, 0xffe9a8);
  if (e.hp <= 0) kill(sim, e, 'normal');
}

const DEATH_COLORS: Partial<Record<Enemy['type'], Color[]>> = {
  alien: [0x9dffbf, 0x5be38c, 0xffffff],
  mason: [0xff4a6a, 0xd8b04a, 0xffffff],
};
const DEFAULT_DEATH: Color[] = [0xffb23e, 0xff5a3c, 0xfff3c0, 0x6b6b6b];

export function kill(sim: Sim, e: Enemy, mode: 'normal' | 'erase') {
  const s = sim.s;
  if (e.dead) return;
  e.dead = true;
  s.kills++;
  s.score += Math.round(e.score * (mode === 'erase' ? 2 : 1) * (1 + s.t / 120));
  gainXp(sim, e.xp);
  if (mode === 'erase') {
    s.erased++;
    const half = e.r * 1.2;
    for (let i = 0; i < 22; i++) {
      part(sim, e.x + (fxRnd() - 0.5) * half * 2, e.y + (fxRnd() - 0.5) * half * 2, (fxRnd() - 0.5) * 20, -15 - fxRnd() * 35,
        0.6 + fxRnd() * 0.6, fxRnd() < 0.6 ? 0xffffff : 0xffe9a8);
    }
    sim.sfx('erasekill');
  } else {
    boom(sim, e.x, e.y, e.boss ? 90 : 10 + e.r * 2, DEATH_COLORS[e.type] ?? DEFAULT_DEATH);
    sim.sfx(e.boss ? 'big' : 'boom');
    if (e.r >= 6) s.shake = Math.max(s.shake, 3);
  }
  if (e.boss) bossDown(sim, e);
}

export function gainXp(sim: Sim, n: number) {
  const s = sim.s, P = s.P;
  s.xp += n;
  const need = xpToNext(s.lvl);
  if (s.xp < need) return;
  s.xp -= need;
  s.lvl++;
  s.dmgMult *= 1.13;
  floatText(sim, P.x, P.y - 16, 'ASCENSÃO ' + s.lvl, 0xc9b6ff);
  sim.sfx('lvl');
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    part(sim, P.x, P.y, Math.cos(a) * 70, Math.sin(a) * 70, 0.5, 0xc9b6ff);
  }
  if (s.lvl % 5 === 0) queueUpgrade(sim, 'Ascensão ' + s.lvl, 0.4);
}

/**
 * Every hit on the player goes through here. `continuous` (contact damage) skips
 * the hit sound, screen shake and the phase shield.
 */
export function damagePlayer(sim: Sim, amt: number, continuous = false) {
  const s = sim.s, P = s.P;
  if (P.dead) return;
  if (!continuous && s.up.phase > 0 && s.phaseCd <= 0) {
    s.phaseCd = Math.max(3, 8 - (s.up.phase - 1) * 2);
    shockRing(sim, P.x, P.y, 0.3, 22);
    floatText(sim, P.x, P.y - 14, 'FASE', 0x9be8ff);
    sim.sfx('tp');
    return;
  }
  P.hp -= amt;
  P.hurt = 0.08;
  if (!continuous) {
    sim.sfx('hit');
    s.shake = Math.max(s.shake, 3);
  }
  if (P.hp <= 0) {
    P.hp = 0;
    die(sim);
  }
}

function die(sim: Sim) {
  const s = sim.s, P = s.P;
  P.dead = true;
  s.over = true;
  s.overT = 1.5;
  s.shake = 12;
  sim.sfx('big');
  for (let i = 0; i < 120; i++) {
    const a = fxRnd() * TAU, v = 10 + fxRnd() * 120;
    part(sim, P.x, P.y, Math.cos(a) * v, Math.sin(a) * v, 0.6 + fxRnd() * 1.2, fxRnd() < 0.5 ? 0xffd25e : 0xffffff, fxRnd() < 0.3 ? 2 : 1);
  }
}
