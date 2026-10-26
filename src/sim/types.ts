import type { BossDef } from './data/bosses.ts';
import type { UpgradeDef, UpgradeId } from './data/upgrades.ts';

export type EnemyType = 'soldier' | 'tank' | 'jet' | 'agent' | 'missile' | 'mason' | 'alien' | 'boss';

/** Colors are 0xRRGGBB numbers so the renderer can use them directly. */
export type Color = number;

export interface Player {
  x: number; y: number;
  hp: number; max: number;
  /** Invulnerability timer (s). */
  inv: number;
  tpCd: number; erCd: number;
  /** Red hurt-flash timer (s). */
  hurt: number;
  dead: boolean;
  aim: number;
  beaming: boolean;
  /** Last movement vector, used by touch teleport. */
  mx: number; my: number;
}

export interface Enemy {
  type: EnemyType;
  x: number; y: number;
  hp: number; max: number;
  score: number; xp: number; r: number;
  /** Age (s). */
  t: number;
  cd: number; cd2: number;
  flash: number;
  sa: number;
  dead: boolean;
  ang: number;
  burst: number; bt: number;
  oa: number; od: number;
  vx: number; dir: number;
  tx: number; ty: number;
  // Boss-only fields (zero / null on regular enemies)
  boss: boolean;
  def: BossDef | null;
  cdA: number; cdB: number;
  ro: number;
  charging: number;
  ca: number;
}

export interface Bullet { x: number; y: number; vx: number; vy: number; r: number; col: Color; dmg: number; dead: boolean }
export interface Shot { x: number; y: number; vx: number; vy: number; life: number; dmg: number }
export interface Strike { x: number; y: number; t: number; done: boolean }

export type Hazard =
  | { type: 'laser'; x: number; y: number; a: number; warn: number; life: number }
  | { type: 'shock'; x: number; y: number; r: number; hit: boolean; done: boolean };

// Cosmetic state. Lives in the sim so it freezes with it, but uses fxRnd.
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; col: Color; s: number; add: boolean }
export interface Ring { x: number; y: number; t: number; dur: number; max: number; inner: number; small: boolean }
export interface FloatText { x: number; y: number; txt: string; col: Color; life: number }
export interface Ghost { x: number; y: number; life: number }

export interface Powers {
  bolts: number;
  beamW: number; beamDmg: number;
  eraseR: number; eraseCd: number;
  tpCd: number; tpBlast: number;
  auraR: number; auraDmg: number;
  regen: number;
  clones: number; time: number; meteor: number; phase: number;
}

export interface GameState {
  seed: number;
  t: number;
  score: number; kills: number; erased: number; heroes: number;
  lvl: number; xp: number; dmgMult: number;
  P: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  shots: Shot[];
  hazards: Hazard[];
  strikes: Strike[];
  fx: { parts: Particle[]; rings: Ring[]; texts: FloatText[]; ghosts: Ghost[] };
  spawnT: number;
  nextBoss: number; bossCount: number; boss: Enemy | null;
  shake: number; invert: number;
  shotT: number;
  threat: string;
  over: boolean; overT: number;
  up: Powers;
  lv: Partial<Record<UpgradeId, number>>;
  choices: UpgradeDef[];
  choosing: boolean;
  pendingUp: number; upDelay: number; upReason: string[];
  freeze: number; tsCd: number; tsMax: number;
  phaseCd: number; cloneT: number; meteorT: number;
}

/** What the player is doing this step. Built by the input layer; one-shot flags are cleared by the sim when consumed. */
export interface SimInput {
  moveX: number; moveY: number;
  /** Aim target in game units (desktop). Ignored when `touch` is true (auto-aim). */
  aimX: number; aimY: number;
  touch: boolean;
  beam: boolean;
  erase: boolean;
  tp: boolean;
  time: boolean;
}

export type SfxKey = 'shot' | 'boom' | 'big' | 'erase' | 'erasekill' | 'tp' | 'hit' | 'lvl' | 'boss' | 'zap';

export interface UpgradeCard { id: UpgradeId; name: string; desc: string; isNew: boolean; level: number; max: number }

export type SimEvent =
  | { type: 'sfx'; key: SfxKey }
  | { type: 'banner'; title: string; sub: string; dur: number }
  | { type: 'threat'; name: string }
  | { type: 'boss-spawn'; name: string }
  | { type: 'boss-down' }
  | { type: 'upgrade-offer'; reason: string; cards: UpgradeCard[] }
  | { type: 'game-over' };
