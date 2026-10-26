// The game simulation. Pure TypeScript: no Phaser, no DOM, so it runs headless in tests and tools/balance.ts.
import { spawnBoss, updateHazards } from './bosses.ts';
import { damagePlayer } from './combat.ts';
import { threatName } from './data/enemies.ts';
import { spawnEnemy, updateSpawner, updEnemy } from './enemies.ts';
import { part, updateFx } from './fx.ts';
import { aimAngle, doErase, doTime, doTp, updateAttacks, updateClones, updateShots, updateStrikes } from './powers.ts';
import { createState } from './state.ts';
import type { GameState, SfxKey, SimEvent, SimInput } from './types.ts';
import { clamp, compact, dist, fxRnd, H, mulberry32, W } from './util.ts';
import { chooseUpgrade, openUpgrade } from './upgrades.ts';

/** Fixed simulation step (s). */
export const STEP = 1 / 60;

export class Sim {
  readonly s: GameState;
  /** Seeded gameplay RNG. */
  readonly rnd: () => number;
  private events: SimEvent[] = [];

  constructor(seed = (Math.random() * 2 ** 32) >>> 0) {
    this.rnd = mulberry32(seed);
    this.s = createState(seed);
  }

  emit(e: SimEvent) { this.events.push(e); }
  sfx(key: SfxKey) { this.events.push({ type: 'sfx', key }); }
  banner(title: string, sub = '', dur = 2.4) { this.events.push({ type: 'banner', title, sub, dur }); }

  /** Returns and clears the events produced since the last call. */
  drain(): SimEvent[] {
    const out = this.events;
    this.events = [];
    return out;
  }

  chooseUpgrade(i: number) { return chooseUpgrade(this, i); }

  /** Advance one step. Do not call while `s.choosing` is true. */
  step(dt: number, input: SimInput) {
    const s = this.s, P = s.P;
    updateFx(this, dt);

    if (s.over) {
      for (const b of s.bullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
      if (s.overT > 0 && (s.overT -= dt) <= 0) this.emit({ type: 'game-over' });
      return;
    }
    if (s.pendingUp > 0 && (s.upDelay -= dt) <= 0) { openUpgrade(this); return; }
    s.t += dt;

    const th = threatName(s.t);
    if (th !== s.threat) {
      s.threat = th;
      this.emit({ type: 'threat', name: th });
      this.banner('Nova ameaça', th, 2);
    }

    // Movement, aim, cooldowns, regen
    P.mx = input.moveX;
    P.my = input.moveY;
    P.beaming = input.beam;
    const spd = 115 * (P.beaming ? 0.55 : 1);
    P.x = clamp(P.x + P.mx * spd * dt, 8, W - 8);
    P.y = clamp(P.y + P.my * spd * dt, 10, H - 10);
    P.aim = aimAngle(this, input);
    P.inv = Math.max(0, P.inv - dt);
    P.hurt = Math.max(0, P.hurt - dt);
    P.tpCd = Math.max(0, P.tpCd - dt);
    P.erCd = Math.max(0, P.erCd - dt);
    P.hp = Math.min(P.max, P.hp + s.up.regen * dt);
    s.tsCd = Math.max(0, s.tsCd - dt);
    s.phaseCd = Math.max(0, s.phaseCd - dt);
    if (input.erase) { input.erase = false; doErase(this); }
    if (input.tp) { input.tp = false; doTp(this, input); }
    if (input.time) { input.time = false; doTime(this); }

    updateClones(this, dt);
    updateStrikes(this, dt);
    updateAttacks(this, dt);
    updateShots(this, dt);

    // Time stop: the world waits, only Omega acts
    if (s.freeze > 0) {
      s.freeze -= dt;
      for (const e of s.enemies) if (e.flash > 0) e.flash -= dt;
      compact(s.enemies, e => !e.dead);
      if (s.freeze <= 0) this.sfx('tp');
      return;
    }

    if (!s.boss && s.t >= s.nextBoss) spawnBoss(this);
    updateSpawner(this, dt);

    for (let i = 0; i < s.enemies.length; i++) {
      const e = s.enemies[i];
      if (!e.dead) updEnemy(this, e, dt);
    }
    compact(s.enemies, e => !e.dead);

    updateHazards(this, dt);

    // Enemy bullets
    for (const b of s.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10) { b.dead = true; continue; }
      if (!P.dead && P.inv <= 0 && Math.abs(b.x - P.x) < b.r + 3 && Math.abs(b.y - P.y) < b.r + 3 && dist(b.x, b.y, P.x, P.y) < b.r + 2.5) {
        b.dead = true;
        damagePlayer(this, b.dmg);
        for (let i = 0; i < 5; i++) part(this, b.x, b.y, (fxRnd() - 0.5) * 60, (fxRnd() - 0.5) * 60, 0.25, b.col);
      }
    }
    compact(s.bullets, b => !b.dead);
  }

  /** Debug/test helper: force-spawn an enemy now. */
  spawn(type: Parameters<typeof spawnEnemy>[1], x?: number, y?: number) { return spawnEnemy(this, type, x, y); }
}
