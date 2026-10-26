# Singularidade

Browser bullet hell (pt-BR) built with Phaser 4 + Vite + TypeScript. Load the `singularidade-dev` skill before changing code; it has the architecture map, invariants and verification steps.

- `src/sim/` is pure TypeScript (no Phaser, no DOM), deterministic: gameplay randomness uses `sim.rnd()`, cosmetic randomness uses `fxRnd()`.
- Player-facing text is Portuguese (pt-BR); code, comments and identifiers are English. Docs in `docs/` are pt-BR except `08-architecture.md`.
- Before finishing: `npm run typecheck && npm test`; balance changes also `npm run sim -- 20` before/after; visual changes `npm run playtest` (with `npm run dev` running) and look at `.playtest/*.png`.
- Keep `docs/` in sync with any number or behavior you change (table in the `singularidade-dev` skill).
- `legacy/` is the original vanilla JS version, reference only. Don't edit it.
