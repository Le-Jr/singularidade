---
name: game-content
description: Step-by-step recipes for adding or changing gameplay content in Singularidade — new enemy types, super-hero bosses, evolution cards (upgrades), new player powers and threat tiers — with every file to touch, the sim/render wiring, a test to add and the docs to update. Use whenever the request is "add/change an enemy, boss, hero, power, upgrade, card, threat or wave".
---

# Adding gameplay content

Read the `singularidade-dev` skill first for the invariants (pure sim, two RNGs, fixed step). Every recipe ends with: `npm run typecheck && npm test`, `npm run sim -- 20` (compare with before), a playtest screenshot of the new thing, and the docs update.

Keep the game's voice: enemies are human/alien forces trying to stop Ômega; bosses are **original** super-heroes (never existing IP), named in Portuguese with a short epithet ("A tempestade que pensa"). All player-facing text is pt-BR.

## New enemy type

1. **Type:** add the name to `EnemyType` in `src/sim/types.ts`.
2. **Stats:** add `{ hp, score, xp, r }` to `ENEMY_BASE` in `src/sim/data/enemies.ts` (HP gets `× (1 + t/110)` automatically). Add a faction bullet color to `BULLET` if it shoots — pick a saturated color distinct from the existing ones (see `pixel-art-and-sfx`).
3. **Spawning:** add `{ type, at, weight }` to `UNLOCK`. If it introduces a new phase, add a tier to `THREATS` (the HUD banner "Nova ameaça" is automatic).
4. **Spawn setup:** if it needs per-instance fields, set them in `spawnEnemy()` (`src/sim/enemies.ts`) using `sim.rnd()`. Reuse the generic fields on `Enemy` (`cd`, `cd2`, `sa`, `ang`, `oa`, `od`, `tx`, `ty`, `vx`, `dir`, `burst`, `bt`) before adding new ones; if you add one, also add it to `blankEnemy()`.
5. **Behavior:** add a `case` in `updEnemy()`. Building blocks: `keep(e, dx, dy, d, wantDist, speed, dt)` to hold distance and strafe; `shoot`, `fan`, `ring` from `combat.ts` (they apply damage and speed scaling); `spawnEnemy` for summons. Timers count down with `(e.cd -= dt) <= 0`. Cosmetic trails use `part(...)` with `fxRnd()`.
6. **Art:** add pixel rows + palette to `ENEMY_ART` in `src/render/art.ts` (texture key `spr:<type>` and the flash silhouette are generated automatically). Special drawing (turret, beam, rotation) goes in `WorldView.drawEnemies()`.
7. **Death colors (optional):** `DEATH_COLORS` in `combat.ts`.
8. **Test:** in `tests/sim.test.ts`, spawn it with `sim.spawn('<type>', x, y)`, step a few seconds, assert its signature behavior (shoots, moves, dies to erase).
9. **Docs:** `docs/04-inimigos.md` (table + behavior), `docs/01-visao-geral.md` (threat table) if a tier was added, `docs/09-arte-e-audio.md` (sprite + bullet color).

## New boss (super-hero)

1. **Def:** append to `BOSSES` in `src/sim/data/bosses.ts`: `{ id, name, sub, scale, r, hp, col, glow }`. `id` must equal its index. Bosses cycle in array order, so appending changes the cycle length (the "Nv 2" tag uses `BOSSES.length`).
2. **Palette:** append to `BOSS_PALETTES` in `src/render/art.ts` (same index). Keys of the shared `HERO_ROWS` template: `h` hair/helmet, `s` skin, `e` eyes, `c`/`C` cape/suit dark/light, `a` emblem, `S` shoulders, `l` legs, `b` boots. Need a different silhouette? Add a dedicated rows array and branch in `buildTextures`.
3. **Attacks:** add a `case <id>` in `updBoss()` (`src/sim/bosses.ts`). Convention: `cdA` = main pattern (fast, bullets), `cdB` = special (telegraphed). Use `BOSS_DMG` for bullet damage. Telegraph anything big (the laser warns for 0.75 s). Bosses have a 3 s entrance and are clamped to the arena.
4. **New hazard kind?** Add a variant to `Hazard` in `types.ts`, update it in `updateHazards()` and draw it in `WorldView.drawHazards()`. Hazards are cleared on boss death.
5. **Per-boss visuals:** extra overlays (Égide's shield, Sentinela's visor) go in `WorldView.drawEnemies()` under `if (def.id === N)`.
6. **Test:** set `sim.s.bossCount = <index>` and `sim.s.t = sim.s.nextBoss`, step, assert `sim.s.boss.def.name`.
7. **Docs:** `docs/05-chefes.md` (section with stats, attacks and "Como vencer").

## New evolution card (upgrade)

1. Add the id to `UpgradeId` and an entry to `UPGRADES` in `src/sim/data/upgrades.ts`: `{ id, name, max, desc(level), apply(s) }`. `power: true` marks it as a new power ("Novo poder" tag at level 1). `desc(0)` describes unlocking, `desc(l>0)` the next level.
2. If it needs state, add a field to `Powers` in `types.ts` and its base value in `createState()` (`up`).
3. Read the field where the effect happens (powers.ts, combat.ts, Sim.step...). An active power needs: an input flag in `SimInput`, a key in `Controls.keyDown`, a mobile button in index.html + `Controls.hold`, a HUD indicator (`#powers` + `Hud.sync`), and the controls list in the menu.
4. The `never offers an upgrade past its max level` test covers caps automatically.
5. **Docs:** `docs/06-evolucoes.md` (table) and `docs/03-poderes.md` if it is a power.

## Changing an existing number

Find it in the data tables or `createState()` first; the tuning table in `balance-tuning` lists where each curve lives. Then update the doc that quotes that number — the docs list exact values.
