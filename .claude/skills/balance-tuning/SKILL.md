---
name: balance-tuning
description: Difficulty and balance tuning for Singularidade — where every curve and number lives, the design intent (Ômega is overpowered but always falls around 3–10 minutes), and how to measure a change with the headless seeded simulator (npm run sim) before and after. Use when the user says the game is too hard/easy/long/short, asks to rebalance, or changes HP, damage, spawn rate, XP, boss timing or upgrade values.
---

# Balance tuning

## Design intent

- The player is a god: infinite attacks, high HP, regen, screen-clearing powers. Tension comes from **volume**, not fragility.
- Enemy damage grows **without a cap** (linear in time) while player defenses are capped by upgrades, so every run ends. Target run length: **3 to 15 minutes**, with most players falling between 6 and 10.
- Rewards: each level is +13% damage (compounding); every 5 levels and every boss gives an evolution card. Erasing doubles score, rewarding risky play.

Don't remove the uncapped damage curve or add permanent invulnerability: that breaks the core loop.

## Where the numbers live

| What | Where | Current |
|---|---|---|
| Player HP, start position | `createState()` in `src/sim/state.ts` | 1000 |
| Player speed | `Sim.step` (`spd`) | 115 px/s, ×0.55 while beaming |
| Base power values | `createState()` → `up` | bolts 2, eraseCd 5, tpCd 1.8, aura 18 px / 95 dps, regen 3 |
| Enemy damage scale | `dmScale` in `state.ts` | `1 + t/170` |
| Enemy bullet speed | `bScale` in `state.ts` | `min(1.6, 1 + t/380)` |
| Enemy HP scale | `spawnEnemy` (`hm`) | `1 + t/110` |
| Enemy base stats | `ENEMY_BASE` in `sim/data/enemies.ts` | |
| Unlock times / weights | `UNLOCK` | |
| Spawn interval | `updateSpawner` | `max(0.13, 1.1 − 0.0055·t)`, ×2.3 during a boss |
| Squads | `updateSpawner` | soldiers in threes after 25 s |
| Boss timing | `FIRST_BOSS_AT`, `BOSS_INTERVAL` in `data/bosses.ts` | 70 s, then 55 s after each kill |
| Boss HP | `spawnBoss` | `hp × (1 + 0.65·cycle) × (1 + t/300)` |
| Boss reward | `bossDown` | heal 25%, clear bullets, evolution |
| XP curve | `xpToNext` in `state.ts` | `⌊20 · lvl^1.35⌋` |
| Level damage bonus | `gainXp` in `combat.ts` | ×1.13 per level |
| Evolution cadence | `gainXp` | every 5 levels |
| Score | `kill` in `combat.ts` | `base × (2 if erased) × (1 + t/120)` |
| Upgrade effects / caps | `UPGRADES` in `sim/data/upgrades.ts` | |
| Soft caps (perf) | `MAX_BULLETS` (combat.ts) 950, `MAX_PARTICLES` (fx.ts) 1400 | |

## Measuring

`tools/balance.ts` plays seeded runs with a bot and prints survival percentiles, average level, kills, heroes and score:

```bash
npm run sim -- 30          # 'kite' bot: circles the arena, erases crowds, beams bosses, takes card #1
npm run sim -- 30 idle     # stands still: a floor for "how hard is the start"
```

Workflow:
1. Run the baseline **before** editing and keep the output.
2. Make one change at a time.
3. Run the same command (same run count; seeds are fixed 1000..N) and compare.
4. Report both outputs to the user with the delta, and say the bot is a proxy: a human dodges far better, so look at relative change, not absolute times. Baseline (v2.0, 20 runs): kite median ≈ 150–160 s, idle ≈ 37 s.
5. If the change needs a smarter bot (e.g. testing teleport or time stop), extend `play()` in `tools/balance.ts` rather than reasoning in your head.

For a feel check, use the browser: `window.__singularidade.state` lets you jump (`s.t = 180`), grant upgrades (`s.up.clones = 4`) or set god mode (`s.P.hp = s.P.max = 1e9`).

## After changing a number

Update the docs that quote it — they list exact values: `docs/07-dificuldade-e-pontuacao.md` (curves table with values at 1/3/5 min), `docs/04-inimigos.md`, `docs/05-chefes.md`, `docs/03-poderes.md`, `docs/06-evolucoes.md`, and add a line to `docs/10-changelog-e-roadmap.md`.
