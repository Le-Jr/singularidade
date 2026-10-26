import type { EnemyType } from '../types.ts';

/** Base stats per enemy type. HP is scaled by `1 + t/110` at spawn. */
export const ENEMY_BASE: Record<Exclude<EnemyType, 'boss'>, { hp: number; score: number; xp: number; r: number }> = {
  soldier: { hp: 30, score: 10, xp: 1, r: 4 },
  tank:    { hp: 170, score: 40, xp: 3, r: 7 },
  jet:     { hp: 55, score: 20, xp: 2, r: 6 },
  agent:   { hp: 70, score: 25, xp: 2, r: 4 },
  missile: { hp: 12, score: 6, xp: 1, r: 3 },
  mason:   { hp: 100, score: 35, xp: 3, r: 5 },
  alien:   { hp: 140, score: 50, xp: 4, r: 7 },
};

/** When each type joins the spawn pool (s) and its relative weight once unlocked. */
export const UNLOCK: { type: Exclude<EnemyType, 'boss'>; at: number; weight: number }[] = [
  { type: 'soldier', at: 0, weight: 8 },
  { type: 'tank', at: 20, weight: 3 },
  { type: 'jet', at: 40, weight: 3 },
  { type: 'agent', at: 60, weight: 3 },
  { type: 'missile', at: 80, weight: 3 },
  { type: 'mason', at: 105, weight: 2 },
  { type: 'alien', at: 135, weight: 2 },
];

/** Threat tiers shown in the HUD. Each entry starts at `at` seconds. */
export const THREATS: { at: number; name: string }[] = [
  { at: 0, name: 'Exército' },
  { at: 20, name: 'Blindados' },
  { at: 40, name: 'Força Aérea' },
  { at: 60, name: 'Serviço Secreto' },
  { at: 80, name: 'Mísseis guiados' },
  { at: 105, name: 'Maçons' },
  { at: 135, name: 'Invasão alienígena' },
  { at: 220, name: 'Tudo ao mesmo tempo' },
];

export function threatName(t: number): string {
  let name = THREATS[0].name;
  for (const th of THREATS) if (t >= th.at) name = th.name;
  return name;
}

/** Faction bullet colors (see docs/09-arte-e-audio.md). */
export const BULLET = {
  soldier: 0xff7a3c,
  tank: 0xffb23e,
  jet: 0xff5a3c,
  agent: 0xff3b5c,
  mason: 0xff4a6a,
  alien: 0x9dffbf,
} as const;
