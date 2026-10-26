// Shared math and array helpers for the simulation. No Phaser, no DOM.

/** Internal resolution. Everything is simulated in these units (16:9). */
export const W = 400;
export const H = 225;
export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

/** Distance from point (px,py) to segment (x1,y1)-(x2,y2). */
export function segDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy;
  const t = clamp(l ? ((px - x1) * dx + (py - y1) * dy) / l : 0, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Shortest signed angle from a to b. */
export const angleDiff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/** In-place filter: keeps items where `keep` is true, without allocating a new array. */
export function compact<T>(arr: T[], keep: (v: T) => boolean): void {
  let j = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (keep(v)) arr[j++] = v;
  }
  arr.length = j;
}

/** Seeded PRNG (mulberry32). Gameplay randomness goes through this so runs are reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cosmetic randomness (particles, flicker). Never use it for anything that affects gameplay. */
export const fxRnd = Math.random;
