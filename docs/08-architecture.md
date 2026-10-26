# Architecture

Technical reference for the Phaser 4 + TypeScript version (v2.0). The original single-file vanilla JS version lives in `legacy/` for comparison.

## Overview

```
index.html            DOM: <canvas id="game">, HUD (#hud), overlays (#menu, #pauseOv, #upOv, #overOv)
src/main.ts           fit() sizes #stage to 16:9 and sets --u; creates Phaser.Game (WebGL, pixelArt, Scale.FIT)
src/scenes/GameScene  run flow + fixed-step loop; routes SimEvents to audio and HUD
src/sim/              game logic, no Phaser/DOM (runs in Node)
src/render/           art data, procedural textures, WorldView (draws GameState)
src/input/Controls    keyboard, mouse, touch joystick, mobile buttons → SimInput
src/audio/Synth       Web Audio synthesizer
src/ui/               DOM HUD/overlays, best-score storage
tests/                vitest (sim)
tools/                balance.ts (headless bot runs), playtest.ts (headless Chromium screenshots)
```

The key decision is the **sim/render split**. `src/sim` holds all gameplay and is deterministic for a given seed and input sequence. Phaser is only a view and an input source. This makes the game testable without a browser and opens the door to replays.

```
Controls ──SimInput──▶ Sim.step(1/60) ──mutates──▶ GameState ──read──▶ WorldView (Phaser)
                           │
                           └──SimEvent[]──▶ GameScene.handle ──▶ Synth (sfx), Hud (banners, boss bar, cards, game over)
```

## Game loop

```ts
// GameScene.update
if (running && !paused && !state.choosing) {
  acc += min(0.1, delta);
  while (acc >= STEP && steps < 4 && !state.choosing) { sim.step(STEP, controls.sample()); acc -= STEP; }
  handle(sim.drain()); hud.tick(dt); hud.sync(state);
}
view.draw(state, time, flags);   // always, so the frozen scene stays visible behind overlays
```

`STEP = 1/60`. At most 4 steps per frame; the accumulator is dropped after a long hitch.

### `Sim.step(dt, input)` order

1. Cosmetic fx (texts, particles, rings, ghosts), shake and invert decay.
2. If game over: only bullets move and `overT` counts down to the `game-over` event.
3. If an evolution is pending and `upDelay` elapsed: `openUpgrade()` (sets `choosing`, emits `upgrade-offer`) and return.
4. Advance `t`, threat tier (emits `threat` + banner).
5. Player movement, aim, cooldowns, regen; consume one-shot inputs (`erase`, `tp`, `time`).
6. Clones, falling stars, bolts or beam, player shots.
7. **If time is frozen, return here.**
8. Boss spawn check, spawner, `updEnemy` for each enemy, hazards, enemy bullets vs player.

## Determinism

- `sim.rnd()` is a seeded mulberry32 used for everything that affects gameplay.
- `fxRnd()` (Math.random) is used for cosmetic randomness only: particles and the conditionals that decide whether to spawn them.
- `new Sim(seed)`; `GameScene.start(seed?)` accepts a seed (random by default).

## State model

All run state is one `GameState` object (`src/sim/types.ts`), created by `createState(seed)`:

```ts
{
  seed, t, score, kills, erased, heroes, lvl, xp, dmgMult,
  P: { x, y, hp, max, inv, tpCd, erCd, hurt, dead, aim, beaming, mx, my },
  enemies, bullets, shots, hazards, strikes,
  fx: { parts, rings, texts, ghosts },
  spawnT, nextBoss, bossCount, boss, shake, invert, shotT, threat, over, overT,
  up: { bolts, beamW, beamDmg, eraseR, eraseCd, tpCd, tpBlast, auraR, auraDmg, regen, clones, time, meteor, phase },
  lv, choices, choosing, pendingUp, upDelay, upReason,
  freeze, tsCd, tsMax, phaseCd, cloneT, meteorT
}
```

Arrays are compacted in place with `compact(arr, keep)`. Soft caps: bullets ≤ 950, particles ≤ 1400. Colors are `0xRRGGBB` numbers.

`Enemy` has one fixed shape for every type (unused fields stay at zero) so all enemies share a hidden class; bosses set `boss: true` and `def`.

## Data tables

| Table | File |
|---|---|
| `ENEMY_BASE`, `UNLOCK`, `THREATS`, `BULLET` | `src/sim/data/enemies.ts` |
| `BOSSES`, `FIRST_BOSS_AT`, `BOSS_INTERVAL` | `src/sim/data/bosses.ts` |
| `UPGRADES` (each with `desc(level)` and `apply(state)`) | `src/sim/data/upgrades.ts` |
| Sprites and boss palettes | `src/render/art.ts` |

## Enemies and bosses

- `spawnEnemy(sim, type, x?, y?)` scales HP by `1 + t/110` and places the enemy on a random edge unless coordinates are given.
- `updEnemy` holds per-type behavior in a `switch`. `keep()` holds a preferred distance while strafing.
- Bullet helpers `shoot`, `ring`, `fan` (in `combat.ts`) apply `dmScale` to damage and `bScale` to speed.
- `updBoss` branches on `def.id` with two timers: `cdA` (main pattern) and `cdB` (special). Hazards: `laser` (telegraphed segment) and `shock` (expanding ring that hits once).
- `bossDown` heals 25%, clears bullets and hazards, schedules the next boss and queues an evolution.

## Player powers

| Function (`powers.ts`) | Trigger |
|---|---|
| `updateAttacks` | bolts automatically; beam while `input.beam` |
| `doErase` | `input.erase` (Space / E / button) |
| `doTp` | `input.tp` (Shift / right click / L / button) |
| `doTime` | `input.time` (Q / button), after unlocking |
| `updateClones`, `updateStrikes` | automatic, after unlocking |
| phase shield | inside `damagePlayer` |
| aura | inside `updEnemy` |

All damage to the player goes through `damagePlayer(sim, amount, continuous)`.

## Upgrade system

`queueUpgrade(sim, reason, delay)` stacks evolution screens. `openUpgrade` filters `UPGRADES` below `max`, shuffles with `sim.rnd`, keeps 3 and emits `upgrade-offer` with display-ready cards. `Sim.chooseUpgrade(i)` applies the card, increments `lv[id]`, and grants 1 s of invulnerability.

## Rendering (`src/render/WorldView.ts`)

- Internal resolution 400×225, `pixelArt: true`, `Scale.FIT` inside `#stage`.
- All textures are generated at boot by `buildTextures()` from code: sprite grids, white flash silhouettes, radial bullet textures (lazily per color/radius), ground, glow, vignette.
- **Two cameras, two layers.** `world` layer (ground, hazards, enemies, bullets, beam, particles, falling stars) is drawn by the main camera; `hero` layer (clones, Ômega, rings, floating texts, joystick, crosshair, vignette, hurt tint) by a second camera. During time stop only the world camera gets a desaturating ColorMatrix filter, so Ômega keeps his color. The erase flash applies `negative()` to both.
- Ordering inside a layer uses `setDepth` with the constants in `D`.
- Sprites, bullets, shots, ghosts, clones and texts use grow-only pools that hide unused objects each frame. Lines, circles and particles are redrawn each frame in a few `Graphics` objects (normal and additive).
- Screen shake jitters both camera scrolls by an integer offset; the vignette and hurt tint have `scrollFactor(0)`.

## Input (`src/input/Controls.ts`)

- Keyboard and pointer come from Phaser's input plugin; one-shot actions are latched into `SimInput` flags that the sim clears when consumed.
- Touch: the first touch on the left 60% creates the virtual joystick (`(joy − origin) / 28`, clamped to length 1). Touch mode turns on automatically on coarse-pointer devices or on the first touch, switches the HUD to mobile buttons and enables auto-aim.
- Window blur clears keys and auto-pauses.

## Audio (`src/audio/Synth.ts`)

Phaser's sound manager is disabled (`audio.noAudio`). `Synth` owns one AudioContext created on the first user gesture: `tone()`, `noise()`, a persistent beam drone gated by `setBeam()`, and per-key throttling.

## HUD (`src/ui/Hud.ts`)

DOM over the canvas, scaled through the CSS variable `--u` (CSS pixels per game unit). Banners are timed by `Hud.tick`, which only runs while the game runs, so they freeze on pause. Best score: `localStorage['singularidade_best']` in `src/ui/storage.ts`.

## Tooling

| Command | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | typecheck + production build in `dist/` |
| `npm test` | vitest over the sim |
| `npm run sim -- [runs] [kite\|idle]` | seeded headless bot runs with survival percentiles |
| `npm run playtest [-- url]` | headless Chromium (playwright-core + local browser) screenshots in `.playtest/` |

Debug handle: `window.__singularidade` (the GameScene). `__singularidade.state` is the live GameState.

## Tuning cheat sheet

| Want to change | Where |
|---|---|
| Player HP | `createState()` → `P` |
| Player speed | `Sim.step` → `spd` |
| Base power values | `createState()` → `up` |
| Enemy stats | `ENEMY_BASE` |
| Unlock times / weights | `UNLOCK` |
| Difficulty curves | `dmScale`, `bScale` (state.ts), `hm` in `spawnEnemy`, interval in `updateSpawner` |
| Boss timing | `FIRST_BOSS_AT`, `BOSS_INTERVAL` |
| Upgrade cadence | `s.lvl % 5` in `gainXp` |
| XP curve | `xpToNext` |
