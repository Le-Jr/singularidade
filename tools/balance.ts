// Headless balance report: plays N runs with a simple bot and prints survival stats.
// Usage: npm run sim -- [runs=20] [bot=kite|idle]
// Runs on Node's built-in TypeScript support, importing only the Phaser-free sim.
import { Sim, STEP } from '../src/sim/Sim.ts';
import type { SimInput } from '../src/sim/types.ts';
import { H, W } from '../src/sim/util.ts';

const runs = Number(process.argv[2] ?? 20);
const bot = process.argv[3] ?? 'kite';
const MAX_T = 1200;

interface Result { t: number; lvl: number; kills: number; heroes: number; score: number; build: string }

function play(seed: number): Result {
  const sim = new Sim(seed), s = sim.s;
  const input: SimInput = { moveX: 0, moveY: 0, aimX: 0, aimY: 0, touch: true, beam: false, erase: false, tp: false, time: false };
  while (!s.P.dead && s.t < MAX_T) {
    if (s.choosing) sim.chooseUpgrade(0);
    if (bot === 'kite') {
      // Circle the arena center, erase when crowded, freeze time when available
      const a = s.t * 0.6, tx = W / 2 + Math.cos(a) * 110, ty = H / 2 + Math.sin(a) * 60;
      const dx = tx - s.P.x, dy = ty - s.P.y, d = Math.hypot(dx, dy) || 1;
      input.moveX = dx / d;
      input.moveY = dy / d;
      const near = s.enemies.filter(e => Math.hypot(e.x - s.P.x, e.y - s.P.y) < 65).length;
      if (near >= 4 && s.P.erCd <= 0) input.erase = true;
      if (s.up.time > 0 && s.tsCd <= 0 && s.bullets.length > 150) input.time = true;
      input.beam = !!s.boss;
    }
    sim.step(STEP, input);
    sim.drain();
  }
  const build = Object.entries(s.lv).map(([k, v]) => `${k}${v}`).join(' ');
  return { t: s.t, lvl: s.lvl, kills: s.kills, heroes: s.heroes, score: s.score, build };
}

const pct = (xs: number[], p: number) => xs[Math.min(xs.length - 1, Math.floor((xs.length - 1) * p))];
const results = Array.from({ length: runs }, (_, i) => play(1000 + i));
const times = results.map(r => r.t).sort((a, b) => a - b);
const avg = (k: keyof Result) => (results.reduce((n, r) => n + (r[k] as number), 0) / runs).toFixed(1);

console.log(`bot=${bot} runs=${runs}`);
console.log(`survival (s): min ${times[0].toFixed(0)} · p25 ${pct(times, 0.25).toFixed(0)} · median ${pct(times, 0.5).toFixed(0)} · p75 ${pct(times, 0.75).toFixed(0)} · max ${times[times.length - 1].toFixed(0)}`);
console.log(`avg level ${avg('lvl')} · kills ${avg('kills')} · heroes ${avg('heroes')} · score ${avg('score')}`);
const longest = results.reduce((a, b) => (b.t > a.t ? b : a));
console.log(`longest run build: ${longest.build || '(none)'}`);
