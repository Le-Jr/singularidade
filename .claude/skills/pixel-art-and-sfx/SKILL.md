---
name: pixel-art-and-sfx
description: Art and audio direction for Singularidade — the code-defined pixel sprite format, palette and faction colors, readability rules, visual effects in Phaser 4, and the Web Audio synth recipes for sound effects. Use when creating or changing sprites, colors, particles, screen effects, HUD styling or sounds.
---

# Pixel art and synthesized audio

There are **no image or audio files**. Every sprite is a string grid in `src/render/art.ts`, turned into textures by `src/render/textures.ts`; every sound is synthesized in `src/audio/Synth.ts`. Keep it that way unless the user asks otherwise.

## Visual direction

"Modern pixel art (32-bit)": low-res sprites plus effects old consoles couldn't do — additive glow, radial gradients, hundreds of particles, screen shake, color inversion.

- Internal resolution **400×225**, scaled up with nearest-neighbor (`pixelArt: true`). Sprite positions are rounded to whole pixels.
- Setting: 3:14 AM in a wrecked military test zone. Dark purple ground, craters, cracks, test grid, warning stripes.
- **Readability rule:** Ômega is the brightest, warmest thing on screen (gold/white). Enemy bullets are saturated per faction. The ground stays dark and desaturated. A new element must not break this: no gold enemy bullets, no bright ground details.

## Sprite format

```ts
export const ENEMY_ART = {
  soldier: {
    rows: ['..gggg..', '.gGGGGg.', /* ... */],
    pal: { g: '#4f6b2f', G: '#6d8b3c', s: '#e0b48a', k: '#22201c' },
  },
};
```

- One char = one pixel, `.` (or any char missing from `pal`) is transparent. Rows can differ in length; width = longest row.
- Lowercase/uppercase pairs = dark/light shade of the same material (`g`/`G`).
- Sizes: regular enemies 8×10 to 16×11, player 12×16, bosses 16×16 template drawn at 2× or 3×. Keep new enemies ≤ 16 px so the arena stays readable.
- Outline with a near-black of the sprite's own hue (`k`), not pure black.
- A white silhouette (`<key>:flash`) is generated automatically for the 60 ms hit flash.
- Rotated sprites (missile) declare their pivot (see `MISSILE_ORIGIN`) and point right (angle 0).
- Bosses share `HERO_ROWS` recolored by `BOSS_PALETTES[id]` (keys documented in the `game-content` skill).

## Palette

UI tokens (`src/style.css` `:root`): `--void #0c0a12`, `--ink #f1e8d4`, `--dim #8a7fa0`, `--gold #ffd25e` (Ômega, highlights), `--ember #ff5a3c` (danger, bosses, "Novo poder"), `--violet #9b7bff` (XP).

Faction bullet colors (`BULLET` in `src/sim/data/enemies.ts`, boss `col` in `bosses.ts`): soldiers `#ff7a3c`, tanks `#ffb23e`, jets `#ff5a3c`, agents `#ff3b5c`, masons `#ff4a6a`, aliens `#9dffbf`, Égide `#7ff0e0`, Valquíria `#d9c6ff`, Titã `#ff8a3c`/`#ffde59`, Sentinela `#6bf3ff`. A new faction gets a hue not already taken. Bullet textures (white core → color → transparent) are generated per color/radius by `bulletTexture()`.

Typography: **Pixelify Sans** (titles, big numbers) and **Silkscreen** (labels, HUD, uppercase with letter-spacing), from Google Fonts with monospace fallback.

## Effects in Phaser 4 (WorldView)

| Effect | How |
|---|---|
| Glow, beam, bullets, sparks | `Phaser.BlendModes.ADD` on the image/Graphics |
| Particles | sim `part()`/`boom()` with `fxRnd()`, drawn as 1–2 px rects in `drawParticles` |
| Expanding ring | `shockRing()` in `sim/fx.ts` |
| Screen shake | set `s.shake` (decays 25/s); WorldView jitters both cameras |
| Invert flash | set `s.invert` (s); ColorMatrix `negative()` on both cameras |
| Time-stop grey | world camera ColorMatrix `saturate(-0.85)` + blue tint rect; hero layer keeps color |
| Hurt tint | automatic from `P.hurt` |

Put Ômega-related visuals in the `hero` layer and world visuals in the `world` layer, with a depth from `D`.

## Sound recipes (`src/audio/Synth.ts`)

Two primitives:
- `tone(f1, f2, dur, type, vol, delay?)` — oscillator with exponential pitch sweep f1→f2 and volume decay.
- `noise(dur, vol, lowpassHz)` — filtered white noise burst.

| Sound | Recipe |
|---|---|
| shot | square 880→520 Hz, 50 ms, very quiet (0.01) |
| boom | noise 0.25 s, lowpass 900 |
| big | noise 1 s lowpass 500 + saw 120→35 Hz |
| erase | saw 1800→50 Hz + bright noise (3500) |
| tp | triangle 260→1500 Hz |
| hit | square 170→70 Hz |
| lvl | two rising triangles, the second 90 ms later |
| boss | two detuned low saws (110/116 Hz) |
| zap | bright noise + square 1200→200 |
| beam | continuous saw 82 Hz + square 164.5 Hz → lowpass 900, gated by `setBeam()` |

To add one: add the key to `SfxKey` (`sim/types.ts`), a `case` in `Synth.play`, an optional throttle in `GAP`, and call `sim.sfx('<key>')` from the sim. Keep volumes ≤ 0.1 (0.3 for big noise) and throttle anything that can fire many times per frame. Audio only starts after a user gesture (`Synth.init()` on "DESPERTAR" or the M key).

Update `docs/09-arte-e-audio.md` when sprites, palette or sounds change.
