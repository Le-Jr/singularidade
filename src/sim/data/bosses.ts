import type { Color } from '../types.ts';

export interface BossDef {
  id: number;
  name: string;
  sub: string;
  /** Sprite scale (the art is a shared 16×16 template). */
  scale: number;
  r: number;
  hp: number;
  /** Bullet color. */
  col: Color;
  /** Additive halo color. */
  glow: Color;
}

/** Bosses arrive in this order and loop, stronger each cycle. Palettes live in render/art.ts. */
export const BOSSES: BossDef[] = [
  { id: 0, name: 'Capitão Égide', sub: 'O escudo da nação', scale: 2, r: 12, hp: 3400, col: 0x7ff0e0, glow: 0x2f8a7e },
  { id: 1, name: 'Valquíria Volt', sub: 'A tempestade que pensa', scale: 2, r: 12, hp: 3800, col: 0xd9c6ff, glow: 0x7b4dff },
  { id: 2, name: 'Titã Carmesim', sub: 'Força sem limite', scale: 3, r: 18, hp: 5200, col: 0xff8a3c, glow: 0xa8231f },
  { id: 3, name: 'Sentinela Estelar', sub: 'Guardiã da órbita', scale: 2, r: 12, hp: 4400, col: 0x6bf3ff, glow: 0x6bf3ff },
];

export const FIRST_BOSS_AT = 70;
export const BOSS_INTERVAL = 55;
