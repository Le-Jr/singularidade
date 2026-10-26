// Enemy spawning and per-type behavior.
import { updBoss } from './bosses.ts';
import { damagePlayer, fan, hurt, ring, shoot } from './combat.ts';
import { BULLET, ENEMY_BASE, UNLOCK } from './data/enemies.ts';
import { boom, part } from './fx.ts';
import type { Sim } from './Sim.ts';
import { dmScale } from './state.ts';
import type { Enemy, EnemyType } from './types.ts';
import { angleDiff, clamp, dist, fxRnd, H, TAU, W } from './util.ts';

type RegularType = Exclude<EnemyType, 'boss'>;

/** Random point just outside a random edge of the arena. */
export function edgePoint(sim: Sim): [number, number] {
  const r = sim.rnd, side = (r() * 4) | 0;
  if (side === 0) return [r() * W, -12];
  if (side === 1) return [W + 12, r() * H];
  if (side === 2) return [r() * W, H + 12];
  return [-12, r() * H];
}

export function blankEnemy(type: EnemyType, x: number, y: number): Enemy {
  return {
    type, x, y, hp: 1, max: 1, score: 0, xp: 0, r: 4, t: 0, cd: 0, cd2: 0, flash: 0, sa: 0, dead: false,
    ang: 0, burst: 0, bt: 0, oa: 0, od: 1, vx: 0, dir: 1, tx: 0, ty: 0,
    boss: false, def: null, cdA: 0, cdB: 0, ro: 0, charging: 0, ca: 0,
  };
}

export function spawnEnemy(sim: Sim, type: RegularType, x?: number, y?: number): Enemy {
  const s = sim.s, r = sim.rnd, b = ENEMY_BASE[type];
  const hm = 1 + s.t / 110;
  if (x === undefined || y === undefined) [x, y] = edgePoint(sim);
  const e = blankEnemy(type, x, y);
  e.hp = e.max = b.hp * hm;
  e.score = b.score; e.xp = b.xp; e.r = b.r;
  e.cd = 1 + r() * 1.2;
  e.cd2 = 3 + r() * 3;
  e.sa = r() * TAU;
  e.oa = r() * TAU;
  e.od = r() < 0.5 ? 1 : -1;
  if (type === 'jet') {
    const left = r() < 0.5;
    e.x = left ? -14 : W + 14;
    e.y = 18 + r() * (H - 36);
    e.dir = left ? 1 : -1;
    e.vx = e.dir * (105 + Math.min(80, s.t * 0.25));
  }
  if (type === 'missile') e.ang = Math.atan2(s.P.y - e.y, s.P.x - e.x);
  if (type === 'alien') { e.tx = 40 + r() * (W - 80); e.ty = 30 + r() * (H - 60); }
  s.enemies.push(e);
  return e;
}

/** Weighted random pick among the types unlocked at the current time. */
export function pickType(sim: Sim): RegularType {
  const pool = UNLOCK.filter(u => sim.s.t >= u.at);
  let tot = 0;
  for (const u of pool) tot += u.weight;
  let roll = sim.rnd() * tot;
  for (const u of pool) {
    roll -= u.weight;
    if (roll <= 0) return u.type;
  }
  return 'soldier';
}

/** Regular spawn tick. Called every step while time is not frozen. */
export function updateSpawner(sim: Sim, dt: number) {
  const s = sim.s;
  if ((s.spawnT -= dt) > 0) return;
  s.spawnT = Math.max(0.13, 1.1 - s.t * 0.0055) * (s.boss ? 2.3 : 1);
  const type = pickType(sim);
  if (type === 'soldier' && s.t > 25) {
    const [x, y] = edgePoint(sim);
    for (let i = 0; i < 3; i++) spawnEnemy(sim, 'soldier', x + (sim.rnd() - 0.5) * 20, y + (sim.rnd() - 0.5) * 20);
  } else spawnEnemy(sim, type);
}

/** Hold a preferred distance from the player while strafing sideways. */
export function keep(e: Enemy, dx: number, dy: number, d: number, want: number, spd: number, dt: number) {
  let k = 0;
  if (d > want) k = 1;
  else if (d < want - 25) k = -0.7;
  const px = -dy / d, py = dx / d, w = Math.sin(e.t * 1.3 + e.sa) * 0.45;
  e.x += ((dx / d) * k + px * w) * spd * dt;
  e.y += ((dy / d) * k + py * w) * spd * dt;
}

export function updEnemy(sim: Sim, e: Enemy, dt: number) {
  const s = sim.s, P = s.P, r = sim.rnd;
  e.t += dt;
  if (e.flash > 0) e.flash -= dt;
  const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
  switch (e.type) {
    case 'soldier':
      keep(e, dx, dy, d, 85, 30, dt);
      if ((e.cd -= dt) <= 0) { e.cd = 1.6 + r() * 0.7; shoot(sim, e.x, e.y, a, 72, 2, BULLET.soldier, 20); }
      break;
    case 'tank':
      keep(e, dx, dy, d, 130, 14, dt);
      e.ang += angleDiff(e.ang, a) * Math.min(1, dt * 2);
      if ((e.cd -= dt) <= 0) {
        e.cd = 2.7 + r();
        fan(sim, e.x + Math.cos(e.ang) * 9, e.y + Math.sin(e.ang) * 9, e.ang, 3, 0.26, 62, 3, BULLET.tank, 34);
        s.shake = Math.max(s.shake, 1.5);
      }
      if (s.t > 150 && (e.cd2 -= dt) <= 0) { e.cd2 = 8 + r() * 3; spawnEnemy(sim, 'missile', e.x, e.y); }
      break;
    case 'jet':
      e.x += e.vx * dt;
      if ((e.cd -= dt) <= 0 && e.x > 0 && e.x < W) {
        e.cd = 0.2;
        shoot(sim, e.x, e.y, Math.PI / 2, 52, 2, BULLET.jet, 18);
        shoot(sim, e.x, e.y, -Math.PI / 2, 52, 2, BULLET.jet, 18);
      }
      if (fxRnd() < 0.6) part(sim, e.x - e.dir * 8, e.y, -e.dir * 30, (fxRnd() - 0.5) * 8, 0.3, 0xffb23e);
      if ((e.dir > 0 && e.x > W + 20) || (e.dir < 0 && e.x < -20)) e.dead = true;
      break;
    case 'agent': {
      e.oa += dt * 0.9 * e.od;
      const tx = P.x + Math.cos(e.oa) * 70, ty = P.y + Math.sin(e.oa) * 70;
      const ddx = tx - e.x, ddy = ty - e.y, dd = Math.hypot(ddx, ddy) || 1, step = Math.min(dd, 66 * dt * 2.2) * 0.5;
      e.x += (ddx / dd) * step;
      e.y += (ddy / dd) * step;
      if ((e.cd -= dt) <= 0) { e.cd = 2.1 + r(); e.burst = 3; e.bt = 0; }
      if (e.burst > 0 && (e.bt -= dt) <= 0) { e.bt = 0.11; e.burst--; shoot(sim, e.x, e.y, a, 118, 2, BULLET.agent, 20); }
      break;
    }
    case 'missile': {
      e.ang += clamp(angleDiff(e.ang, a), -2.4 * dt, 2.4 * dt);
      const sp = 82 + Math.min(50, s.t * 0.15);
      e.x += Math.cos(e.ang) * sp * dt;
      e.y += Math.sin(e.ang) * sp * dt;
      part(sim, e.x - Math.cos(e.ang) * 4, e.y - Math.sin(e.ang) * 4, (fxRnd() - 0.5) * 10, (fxRnd() - 0.5) * 10, 0.35, fxRnd() < 0.5 ? 0xffb23e : 0x8a8a8a);
      if (e.t > 7) { e.dead = true; boom(sim, e.x, e.y, 10, [0xffb23e, 0xff5a3c]); }
      if (d < e.r + 4 && P.inv <= 0) {
        e.dead = true;
        boom(sim, e.x, e.y, 16, [0xffb23e, 0xff5a3c, 0xffffff]);
        damagePlayer(sim, 55 * dmScale(s));
        s.shake = 5;
      }
      break;
    }
    case 'mason':
      keep(e, dx, dy, d, 110, 18, dt);
      if ((e.cd -= dt) <= 0) {
        e.cd = 2.8 + r() * 0.6;
        ring(sim, e.x, e.y, 12 + Math.min(10, (s.t / 30) | 0), 46, 2, BULLET.mason, 22, e.sa);
        e.sa += 0.25;
      }
      break;
    case 'alien': {
      if ((e.cd2 -= dt) <= 0 || dist(e.x, e.y, e.tx, e.ty) < 6) {
        e.cd2 = 3;
        e.tx = 40 + r() * (W - 80);
        e.ty = 30 + r() * (H - 60);
      }
      const ddx = e.tx - e.x, ddy = e.ty - e.y, dd = Math.hypot(ddx, ddy) || 1;
      e.x += (ddx / dd) * 32 * dt;
      e.y += (ddy / dd) * 32 * dt;
      if ((e.cd -= dt) <= 0) { e.cd = 0.11; shoot(sim, e.x, e.y, e.sa, 55, 2, BULLET.alien, 18); e.sa += 0.36; }
      break;
    }
    case 'boss':
      updBoss(sim, e, dt, dx, dy, d, a);
      break;
  }
  if (e.dead) return;
  // Omega's aura burns anything close; touching an enemy hurts Omega
  if (d < e.r + s.up.auraR) hurt(sim, e, s.up.auraDmg * s.dmgMult * dt, true);
  if (d < e.r + 4 && P.inv <= 0 && e.type !== 'missile') damagePlayer(sim, (e.boss ? 90 : 30) * dmScale(s) * dt, true);
}
