import { FIRST_BOSS_AT } from './data/bosses.ts';
import { threatName } from './data/enemies.ts';
import type { GameState } from './types.ts';
import { H, W } from './util.ts';

/** Fresh run state. Tuning: player HP/regen here, base power values in `up`. */
export function createState(seed: number): GameState {
  return {
    seed,
    t: 0, score: 0, kills: 0, erased: 0, heroes: 0,
    lvl: 1, xp: 0, dmgMult: 1,
    P: { x: W / 2, y: H / 2 + 20, hp: 1000, max: 1000, inv: 0, tpCd: 0, erCd: 0, hurt: 0, dead: false, aim: 0, beaming: false, mx: 0, my: 0 },
    enemies: [], bullets: [], shots: [], hazards: [], strikes: [],
    fx: { parts: [], rings: [], texts: [], ghosts: [] },
    spawnT: 1.2,
    nextBoss: FIRST_BOSS_AT, bossCount: 0, boss: null,
    shake: 0, invert: 0, shotT: 0,
    threat: threatName(0),
    over: false, overT: 0,
    up: { bolts: 2, beamW: 1, beamDmg: 1, eraseR: 1, eraseCd: 5, tpCd: 1.8, tpBlast: 36, auraR: 18, auraDmg: 95, regen: 3, clones: 0, time: 0, meteor: 0, phase: 0 },
    lv: {}, choices: [], choosing: false, pendingUp: 0, upDelay: 0, upReason: [],
    freeze: 0, tsCd: 0, tsMax: 16, phaseCd: 0, cloneT: 0, meteorT: 2,
  };
}

/** XP needed to go from `lvl` to `lvl + 1`. */
export const xpToNext = (lvl: number) => Math.floor(20 * Math.pow(lvl, 1.35));

/** Enemy damage multiplier over time (no cap: this is why Omega always falls). */
export const dmScale = (s: GameState) => 1 + s.t / 170;
/** Enemy bullet speed multiplier, capped at +60%. */
export const bScale = (s: GameState) => Math.min(1.6, 1 + s.t / 380);
