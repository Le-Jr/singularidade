// Best score in localStorage. Private windows or blocked storage must not break the game.
const KEY = 'singularidade_best';

export function loadBest(): number {
  try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; }
}

export function saveBest(score: number) {
  try { localStorage.setItem(KEY, String(score)); } catch { /* ignore */ }
}
