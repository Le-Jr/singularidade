// Evolution queue and card selection.
import { UPGRADES } from './data/upgrades.ts';
import type { Sim } from './Sim.ts';

/** Stack an evolution screen. Several triggers queue several screens. */
export function queueUpgrade(sim: Sim, reason: string, delay: number) {
  const s = sim.s;
  s.pendingUp++;
  s.upReason.push(reason);
  s.upDelay = Math.max(s.upDelay, delay);
}

/** Draw 3 random cards among upgrades below their max level and pause the sim on them. */
export function openUpgrade(sim: Sim) {
  const s = sim.s;
  s.pendingUp--;
  const reason = s.upReason.shift() || 'Evolução';
  const pool = UPGRADES.filter(u => (s.lv[u.id] ?? 0) < u.max);
  if (!pool.length) return;
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (sim.rnd() * (i + 1)) | 0;
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  s.choices = pool.slice(0, 3);
  s.choosing = true;
  sim.emit({
    type: 'upgrade-offer',
    reason,
    cards: s.choices.map(u => {
      const level = s.lv[u.id] ?? 0;
      return { id: u.id, name: u.name, desc: u.desc(level), isNew: !!u.power && !level, level, max: u.max };
    }),
  });
}

export function chooseUpgrade(sim: Sim, i: number): boolean {
  const s = sim.s;
  if (!s.choosing) return false;
  const u = s.choices[i];
  if (!u) return false;
  u.apply(s);
  const lv = (s.lv[u.id] = (s.lv[u.id] ?? 0) + 1);
  s.choosing = false;
  sim.banner(u.name, u.power && lv === 1 ? 'Novo poder desbloqueado' : 'Nível ' + lv, 1.8);
  sim.sfx('lvl');
  s.P.inv = Math.max(s.P.inv, 1);
  return true;
}
