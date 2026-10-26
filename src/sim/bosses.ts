// Super-hero bosses: spawn, attack patterns, hazards and defeat.
import { damagePlayer, fan, ring, shoot } from './combat.ts';
import { BOSS_INTERVAL, BOSSES } from './data/bosses.ts';
import { blankEnemy, keep, spawnEnemy } from './enemies.ts';
import { part } from './fx.ts';
import type { Sim } from './Sim.ts';
import { dmScale } from './state.ts';
import type { Enemy } from './types.ts';
import { clamp, compact, dist, fxRnd, H, segDist, TAU, W } from './util.ts';
import { queueUpgrade } from './upgrades.ts';

const BOSS_DMG = 26;

export function spawnBoss(sim: Sim) {
  const s = sim.s, def = BOSSES[s.bossCount % BOSSES.length], cycle = s.bossCount;
  const hp = def.hp * (1 + cycle * 0.65) * (1 + s.t / 300);
  const e = blankEnemy('boss', W / 2, -30);
  Object.assign(e, { boss: true, def, hp, max: hp, r: def.r, score: 400 * (cycle + 1), xp: 40, cdA: 1.6, cdB: 3.2 });
  s.enemies.push(e);
  s.boss = e;
  s.bossCount++;
  const lvlTag = cycle >= BOSSES.length ? ' · Nv ' + (Math.floor(cycle / BOSSES.length) + 1) : '';
  sim.banner(def.name, def.sub + lvlTag, 2.8);
  sim.sfx('boss');
  sim.emit({ type: 'boss-spawn', name: def.name });
}

export function bossDown(sim: Sim, e: Enemy) {
  const s = sim.s, P = s.P;
  s.boss = null;
  s.heroes++;
  P.hp = Math.min(P.max, P.hp + P.max * 0.25);
  s.nextBoss = s.t + BOSS_INTERVAL;
  s.shake = 10;
  for (const b of s.bullets) part(sim, b.x, b.y, 0, -10, 0.4, 0xffe9a8);
  s.bullets.length = 0;
  s.hazards.length = 0;
  sim.emit({ type: 'boss-down' });
  sim.banner('Herói derrotado', '+25% de essência', 1.2);
  queueUpgrade(sim, 'Herói derrotado: ' + e.def!.name, 1.1);
}

export function updBoss(sim: Sim, e: Enemy, dt: number, dx: number, dy: number, d: number, a: number) {
  const s = sim.s, def = e.def!;
  // Entrance: descend from the top before attacking
  if (e.y < 48 && e.t < 3) { e.y += 40 * dt; return; }
  const col = def.col;
  if (!(e.charging > 0)) keep(e, dx, dy, d, 85, def.id === 2 ? 24 : 36, dt);
  e.x = clamp(e.x, 16, W - 16);
  e.y = clamp(e.y, 16, H - 16);
  switch (def.id) {
    case 0: // Capitão Égide: shield fan + charge that ends in a ring
      if ((e.cdA -= dt) <= 0) { e.cdA = 0.95; fan(sim, e.x, e.y, a, 7, 0.17, 86, 3, col, BOSS_DMG); }
      if ((e.cdB -= dt) <= 0 && !(e.charging > 0)) { e.cdB = 5.2; e.charging = 0.85; e.ca = a; }
      if (e.charging > 0) {
        e.charging -= dt;
        e.x += Math.cos(e.ca) * 235 * dt;
        e.y += Math.sin(e.ca) * 235 * dt;
        part(sim, e.x, e.y, (fxRnd() - 0.5) * 30, (fxRnd() - 0.5) * 30, 0.3, 0x7ff0e0, 2);
        if (e.charging <= 0) { ring(sim, e.x, e.y, 18, 62, 3, col, BOSS_DMG, sim.rnd()); s.shake = 6; sim.sfx('boom'); }
      }
      break;
    case 1: // Valquíria Volt: triple spiral + telegraphed lightning
      e.sa += dt * 2.2;
      if ((e.cdA -= dt) <= 0) { e.cdA = 0.085; for (let k = 0; k < 3; k++) shoot(sim, e.x, e.y, e.sa + (k * TAU) / 3, 58, 2, col, BOSS_DMG * 0.8); }
      if ((e.cdB -= dt) <= 0) { e.cdB = 3.3; s.hazards.push({ type: 'laser', x: e.x, y: e.y, a, warn: 0.75, life: 0.25 }); }
      if (fxRnd() < 0.4) part(sim, e.x + (fxRnd() - 0.5) * 24, e.y + (fxRnd() - 0.5) * 28, 0, 0, 0.12, 0xffe14d);
      break;
    case 2: // Titã Carmesim: double ring + ground shockwave
      if ((e.cdA -= dt) <= 0) {
        e.cdA = 2.3;
        ring(sim, e.x, e.y, 22, 56, 3, col, BOSS_DMG, e.ro);
        ring(sim, e.x, e.y, 22, 40, 3, 0xffde59, BOSS_DMG, e.ro + TAU / 44);
        e.ro += 0.13;
      }
      if ((e.cdB -= dt) <= 0) { e.cdB = 4.8; s.hazards.push({ type: 'shock', x: e.x, y: e.y + 12, r: 4, hit: false, done: false }); s.shake = 8; sim.sfx('big'); }
      break;
    default: // Sentinela Estelar: quad spiral + missile battery
      e.sa += 0.17 * dt * 60 * 0.25;
      if ((e.cdA -= dt) <= 0) { e.cdA = 0.09; for (let k = 0; k < 4; k++) shoot(sim, e.x, e.y, e.sa + (k * TAU) / 4, 74, 2, col, BOSS_DMG * 0.8); }
      if ((e.cdB -= dt) <= 0) { e.cdB = 3.2; for (let k = 0; k < 3; k++) spawnEnemy(sim, 'missile', e.x + (k - 1) * 10, e.y); }
  }
}

export function updateHazards(sim: Sim, dt: number) {
  const s = sim.s, P = s.P;
  for (const h of s.hazards) {
    if (h.type === 'laser') {
      if (h.warn > 0) {
        h.warn -= dt;
        if (h.warn <= 0) {
          sim.sfx('zap');
          s.shake = Math.max(s.shake, 4);
          if (P.inv <= 0 && segDist(P.x, P.y, h.x, h.y, h.x + Math.cos(h.a) * 500, h.y + Math.sin(h.a) * 500) < 7) damagePlayer(sim, 62 * dmScale(s));
        }
      } else h.life -= dt;
    } else {
      h.r += 135 * dt;
      if (!h.hit && P.inv <= 0 && Math.abs(dist(P.x, P.y, h.x, h.y) - h.r) < 5) { h.hit = true; damagePlayer(sim, 70 * dmScale(s)); }
      if (h.r > 300) h.done = true;
    }
  }
  compact(s.hazards, h => (h.type === 'laser' ? h.life > 0 : !h.done));
}
