---
name: singularidade-dev
description: Core workflow for the Singularidade game (Phaser 4 + Vite + TypeScript bullet hell). Use for any code change in this repo — architecture map, the sim/render split and its invariants, Phaser 4 API gotchas, commands, how to verify a change (typecheck, tests, headless sim, browser playtest) and which docs to update.
---

# Singularidade: development workflow

Bullet hell survival game in Portuguese (pt-BR). The player is Ômega, a god-like being; difficulty grows with time until he falls.

## Stack

- **Phaser 4.2** (WebGL renderer, required) — rendering, input, game loop
- **Vite 8** — dev server and build (`base: './'`, Phaser in its own chunk)
- **TypeScript 7**, strict, `erasableSyntaxOnly` (no enums, no parameter properties, no namespaces) and `.ts` extensions in imports, so Node runs the sim directly
- **Vitest** for sim tests, **playwright-core** + local Chromium for visual playtests
- Web Audio synth (no audio files), DOM HUD over the canvas, `localStorage` for the best score

## Map

```
src/
  main.ts               boot: fit() sizes #stage 16:9 and sets --u, creates Phaser.Game
  scenes/GameScene.ts   run flow (menu/play/pause/evolution/over), fixed-step loop, routes SimEvents
  sim/                  PURE game logic — no Phaser, no DOM
    Sim.ts              Sim class: step(dt, input), events queue, STEP = 1/60
    state.ts            createState() (all tunables for player/powers), xpToNext, dmScale, bScale
    types.ts            GameState, Enemy, SimInput, SimEvent, SfxKey...
    data/               tables: enemies.ts (ENEMY_BASE, UNLOCK, THREATS, BULLET colors), bosses.ts, upgrades.ts
    enemies.ts          spawnEnemy, pickType, updateSpawner, updEnemy (per-type switch), keep()
    bosses.ts           spawnBoss, updBoss (per-id switch), bossDown, updateHazards
    powers.ts           erase, teleport, time stop, clones, falling stars, bolts/beam, player shots
    combat.ts           shoot/ring/fan, hurt, kill, gainXp, damagePlayer
    upgrades.ts         queueUpgrade, openUpgrade, chooseUpgrade
    fx.ts               particles, rings, floating texts (cosmetic, but stored in state)
  render/
    art.ts              pixel-art sprite data (string rows + palettes)
    textures.ts         builds all textures at boot from code (sprites, flash silhouettes, bullets, ground, glow, vignette)
    WorldView.ts        draws GameState each frame with pooled Images + Graphics; never mutates state
  input/Controls.ts     keyboard, mouse, touch joystick, mobile DOM buttons → SimInput
  audio/Synth.ts        Web Audio synthesizer, play(SfxKey), beam drone
  ui/Hud.ts             DOM HUD + overlays (markup in index.html, styles in src/style.css)
  ui/icons.ts           rasterizes ICON_ART (render/art.ts) to data URLs for HUD <img>s
  ui/orientation.ts     landscape on phones: fullscreen + orientation lock, "rotate your phone" screen in portrait
tests/                  vitest, sim only
tools/balance.ts        headless bot runs → survival stats (npm run sim)
tools/playtest.ts       headless Chromium → screenshots in .playtest/ (npm run playtest)
legacy/                 the original single-file vanilla JS version, kept as reference
docs/                   design docs in pt-BR (08-architecture.md is in English)
```

## Invariants (do not break)

1. **`src/sim/` never imports Phaser or touches the DOM.** It must run under Node (`npm run sim`, vitest). Side effects leave the sim only as `SimEvent`s (`sim.sfx()`, `sim.banner()`, `sim.emit()`), drained by `GameScene.handle()`.
2. **Two RNGs.** `sim.rnd()` (seeded mulberry32) for anything that changes gameplay: spawn positions, timers, targeting, spread, card shuffle. `fxRnd()` (Math.random) for purely cosmetic things: particles, flicker, *and the conditionals that decide whether to spawn a particle*. Mixing them breaks determinism; the `is deterministic for a given seed` test catches most cases.
3. **Fixed timestep.** `Sim.step(STEP)` at 60 Hz with an accumulator in `GameScene.update`. Never pass a variable dt to the sim.
4. **WorldView is read-only** over `GameState`. Rendering-only randomness (shake jitter, laser zigzag) uses Math.random there.
5. **Arrays are compacted in place** with `compact(arr, keep)` — don't reassign `s.bullets = s.bullets.filter(...)` (other code may hold the reference).
6. **Units:** everything is in game units on a 400×225 arena (`W`, `H` in `sim/util.ts`). Colors are `0xRRGGBB` numbers in the sim.
7. **Damage to the player always goes through `damagePlayer(sim, amt, continuous)`**; damage to enemies through `hurt()`/`kill()`.
8. User-facing text is **pt-BR**; code, comments and identifiers are English.

## Phaser 4 notes (differs from Phaser 3 tutorials)

- Post-processing is **filters**, not `postFX`/`preFX`: `camera.filters.internal.addColorMatrix()`; toggle with `.active`. `camera.filters` is null on Canvas, so the game forces `type: Phaser.WEBGL`.
- A custom `canvas` in the config requires an explicit renderer type.
- WorldView uses two cameras and two `Layer`s: `world` (desaturated during time stop) and `hero` (keeps color). Objects in a layer are ordered by `setDepth` (constants `D` in WorldView). New objects must go into one of the layers or both cameras will draw them.
- Blend modes: use `Phaser.BlendModes.ADD` (WebGL has no DIFFERENCE; the erase invert is a ColorMatrix `negative()`).
- When unsure of an API, grep `node_modules/phaser/types/phaser.d.ts` instead of guessing from v3 memory.
- Debug handle in the browser console: `window.__singularidade` (the GameScene); `__singularidade.state` is the live GameState, `__singularidade.start(seed)` restarts with a seed.

## Commands

```bash
npm run dev         # http://localhost:5173
npm run typecheck   # tsc --noEmit
npm test            # vitest (sim)
npm run sim -- 20   # headless balance report, 20 seeded runs (bot: kite | idle)
npm run playtest    # needs `npm run dev` running; screenshots in .playtest/
npm run build       # typecheck + production build in dist/
```

## Verifying a change

1. `npm run typecheck && npm test` — always.
2. Gameplay/balance change → `npm run sim -- 20` before and after; report the difference.
3. Visual/input/UI change → start `npm run dev` in the background, run `npm run playtest`, then **look at the screenshots** in `.playtest/` with the Read tool. A clean exit only means no console errors. For a specific situation, add a step to `tools/playtest.ts` or evaluate code against `window.__singularidade.state` (e.g. set `s.t = 69.5` to jump to the first boss, `s.P.hp = 1e9` for god mode).
4. Stop the dev server when done.

## Docs to keep in sync

| Change | Update |
|---|---|
| Enemy stats/behavior | docs/04-inimigos.md |
| Boss | docs/05-chefes.md |
| Power or upgrade | docs/03-poderes.md, docs/06-evolucoes.md |
| Curves, score, XP | docs/07-dificuldade-e-pontuacao.md |
| Controls | docs/02-controles.md + the `ctlDesk`/`ctlMob` lists in index.html |
| Sprites, palette, sounds | docs/09-arte-e-audio.md |
| Structure/architecture | docs/08-architecture.md (English) and this skill |
| Any release | docs/10-changelog-e-roadmap.md |

Related skills: `game-content` (adding enemies/bosses/upgrades), `pixel-art-and-sfx`, `balance-tuning`.
