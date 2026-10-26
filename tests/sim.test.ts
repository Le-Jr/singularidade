import { describe, expect, it } from 'vitest';
import { kill } from '../src/sim/combat.ts';
import { UPGRADES } from '../src/sim/data/upgrades.ts';
import { Sim, STEP } from '../src/sim/Sim.ts';
import type { SimEvent, SimInput } from '../src/sim/types.ts';

const idle = (): SimInput => ({ moveX: 0, moveY: 0, aimX: 300, aimY: 100, touch: true, beam: false, erase: false, tp: false, time: false });

/** Run for `sec` seconds, auto-picking the first card. Returns every event. */
function run(sim: Sim, sec: number, input = idle()): SimEvent[] {
  const events: SimEvent[] = [];
  for (let i = 0; i < Math.round(sec / STEP); i++) {
    if (sim.s.choosing) sim.chooseUpgrade(0);
    sim.step(STEP, input);
    events.push(...sim.drain());
  }
  return events;
}

const immortal = (sim: Sim) => { sim.s.P.max = sim.s.P.hp = 1e12; };

describe('Sim', () => {
  it('is deterministic for a given seed', () => {
    const a = new Sim(42), b = new Sim(42);
    run(a, 30);
    run(b, 30);
    expect(a.s.score).toBe(b.s.score);
    expect(a.s.kills).toBe(b.s.kills);
    expect(a.s.enemies.map(e => [e.type, e.x, e.y])).toEqual(b.s.enemies.map(e => [e.type, e.x, e.y]));
  });

  it('spawns enemies and advances threat tiers', () => {
    const sim = new Sim(1);
    immortal(sim);
    const ev = run(sim, 21);
    expect(sim.s.kills + sim.s.enemies.length).toBeGreaterThan(5);
    expect(ev).toContainEqual({ type: 'threat', name: 'Blindados' });
  });

  it('brings the first hero at 70 s and offers an evolution when it falls', () => {
    const sim = new Sim(7);
    immortal(sim);
    const ev = run(sim, 71);
    expect(ev.some(e => e.type === 'boss-spawn')).toBe(true);
    const boss = sim.s.boss!;
    expect(boss.def!.name).toBe('Capitão Égide');
    kill(sim, boss, 'normal');
    expect(sim.s.heroes).toBe(1);
    const after = run(sim, 1.5);
    expect(after.some(e => e.type === 'upgrade-offer')).toBe(true);
  });

  it('never offers an upgrade past its max level', () => {
    const sim = new Sim(3);
    for (let i = 0; i < 60; i++) {
      sim.s.pendingUp = 1;
      sim.s.upDelay = 0;
      sim.step(STEP, idle());
      if (!sim.s.choosing) break;
      sim.chooseUpgrade(0);
    }
    for (const u of UPGRADES) expect(sim.s.lv[u.id] ?? 0).toBeLessThanOrEqual(u.max);
    const total = UPGRADES.reduce((n, u) => n + u.max, 0);
    expect(Object.values(sim.s.lv).reduce((n, v) => n + (v ?? 0), 0)).toBe(total);
  });

  it('Omega eventually falls when standing still', () => {
    const sim = new Sim(5);
    const ev = run(sim, 900);
    expect(ev.some(e => e.type === 'game-over')).toBe(true);
    expect(sim.s.P.dead).toBe(true);
  });

  it('erase removes regular enemies close to Omega and doubles their score', () => {
    const sim = new Sim(9);
    const P = sim.s.P;
    const e = sim.spawn('soldier', P.x + 20, P.y);
    sim.step(STEP, { ...idle(), erase: true });
    expect(e.dead).toBe(true);
    expect(sim.s.erased).toBe(1);
    expect(sim.s.score).toBe(Math.round(10 * 2 * (1 + sim.s.t / 120)));
  });
});
