// Draws a GameState with Phaser objects. Read-only: never mutates the sim.
//
// Two cameras: `world` (enemies, bullets, effects) gets the time-stop desaturation filter,
// `hero` (Omega, clones, rings, texts, UI-in-canvas) keeps its color. Both get the erase invert.
import Phaser from 'phaser';
import { BEAM_LEN, clonePos, STRIKE_WARN } from '../sim/powers.ts';
import type { GameState } from '../sim/types.ts';
import { clamp, H, TAU, W } from '../sim/util.ts';
import { MISSILE_ORIGIN } from './art.ts';
import { bulletTexture, TEX } from './textures.ts';

const ADD = Phaser.BlendModes.ADD;
const rnd = Math.random;

/** Draw order inside each layer. */
const D = {
  ground: 0, hazards: 1, hazardsAdd: 2, bossGlow: 3, enemies: 4, enemyOverlay: 5, ghosts: 6,
  shots: 7, bullets: 8, beam: 9, partsAdd: 10, parts: 11, strikes: 12, strikesAdd: 13, freeze: 14,
  cloneGlow: 0, clones: 1, playerGlow: 2, playerFx: 3, player: 4, rings: 5, texts: 6, ui: 7, vignette: 8, hurt: 9,
};

/** Grows on demand and hides what was not used this frame. */
class Pool<T extends Phaser.GameObjects.Image | Phaser.GameObjects.Text> {
  private items: T[] = [];
  private used = 0;
  private make: () => T;
  constructor(make: () => T) { this.make = make; }
  begin() { this.used = 0; }
  next(): T {
    let o = this.items[this.used];
    if (!o) { o = this.make(); this.items.push(o); }
    this.used++;
    o.setVisible(true);
    return o;
  }
  end() { for (let i = this.used; i < this.items.length; i++) this.items[i].setVisible(false); }
}

export interface ViewFlags {
  running: boolean;
  touch: boolean;
  mouseX: number; mouseY: number;
  joy: { ox: number; oy: number; x: number; y: number } | null;
}

export class WorldView {
  private worldCam: Phaser.Cameras.Scene2D.Camera;
  private heroCam: Phaser.Cameras.Scene2D.Camera;
  private world: Phaser.GameObjects.Layer;
  private hero: Phaser.GameObjects.Layer;
  private worldFx: Phaser.Filters.ColorMatrix | null = null;
  private heroFx: Phaser.Filters.ColorMatrix | null = null;

  private g: Record<'hazards' | 'hazardsAdd' | 'bossGlow' | 'enemyOverlay' | 'beam' | 'partsAdd' | 'parts' | 'strikes' | 'strikesAdd' | 'playerFx' | 'rings' | 'ui', Phaser.GameObjects.Graphics>;
  private enemies: Pool<Phaser.GameObjects.Image>;
  private ghosts: Pool<Phaser.GameObjects.Image>;
  private shots: Pool<Phaser.GameObjects.Image>;
  private bullets: Pool<Phaser.GameObjects.Image>;
  private cloneGlows: Pool<Phaser.GameObjects.Image>;
  private clones: Pool<Phaser.GameObjects.Image>;
  private texts: Pool<Phaser.GameObjects.Text>;
  private freezeTint: Phaser.GameObjects.Rectangle;
  private playerGlow: Phaser.GameObjects.Image;
  private player: Phaser.GameObjects.Image;
  private hurtTint: Phaser.GameObjects.Rectangle;
  private shotTex: string;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.worldCam = scene.cameras.main;
    this.heroCam = scene.cameras.add(0, 0, W, H);
    this.world = scene.add.layer();
    this.hero = scene.add.layer();
    this.worldCam.ignore(this.hero);
    this.heroCam.ignore(this.world);
    // Filters only exist on WebGL
    if (this.worldCam.filters) {
      this.worldFx = this.worldCam.filters.internal.addColorMatrix();
      this.heroFx = this.heroCam.filters.internal.addColorMatrix();
      this.worldFx.active = this.heroFx.active = false;
    }

    const inWorld = <T extends Phaser.GameObjects.GameObject & { setDepth(d: number): T }>(o: T, d: number) => { o.setDepth(d); this.world.add(o); return o; };
    const inHero = <T extends Phaser.GameObjects.GameObject & { setDepth(d: number): T }>(o: T, d: number) => { o.setDepth(d); this.hero.add(o); return o; };
    const gfx = (layer: 'w' | 'h', d: number, add = false) => {
      const g = scene.add.graphics();
      if (add) g.setBlendMode(ADD);
      return layer === 'w' ? inWorld(g, d) : inHero(g, d);
    };
    const imgPool = (layer: 'w' | 'h', d: number, add = false) => new Pool(() => {
      const img = scene.add.image(0, 0, TEX.player).setOrigin(0.5);
      if (add) img.setBlendMode(ADD);
      return layer === 'w' ? inWorld(img, d) : inHero(img, d);
    });

    inWorld(scene.add.image(0, 0, TEX.ground).setOrigin(0), D.ground);
    this.g = {
      hazards: gfx('w', D.hazards), hazardsAdd: gfx('w', D.hazardsAdd, true), bossGlow: gfx('w', D.bossGlow, true),
      enemyOverlay: gfx('w', D.enemyOverlay), beam: gfx('w', D.beam, true), partsAdd: gfx('w', D.partsAdd, true),
      parts: gfx('w', D.parts), strikes: gfx('w', D.strikes), strikesAdd: gfx('w', D.strikesAdd, true),
      playerFx: gfx('h', D.playerFx, true), rings: gfx('h', D.rings, true), ui: gfx('h', D.ui),
    };
    this.enemies = imgPool('w', D.enemies);
    this.ghosts = imgPool('w', D.ghosts);
    this.shots = imgPool('w', D.shots, true);
    this.bullets = imgPool('w', D.bullets, true);
    this.cloneGlows = imgPool('h', D.cloneGlow, true);
    this.clones = imgPool('h', D.clones);
    this.texts = new Pool(() => inHero(
      scene.add.text(0, 0, '', { fontFamily: 'Silkscreen, monospace', fontSize: '8px' }).setOrigin(0.5, 1).setShadow(1, 1, '#000', 0, false, true),
      D.texts,
    ));
    this.freezeTint = inWorld(scene.add.rectangle(0, 0, W, H, 0x5a8cff, 0.1).setOrigin(0).setScrollFactor(0), D.freeze);
    this.playerGlow = inHero(scene.add.image(0, 0, TEX.glow).setBlendMode(ADD), D.playerGlow);
    this.player = inHero(scene.add.image(0, 0, TEX.player).setOrigin(0), D.player);
    inHero(scene.add.image(0, 0, TEX.vignette).setOrigin(0).setScrollFactor(0), D.vignette);
    this.hurtTint = inHero(scene.add.rectangle(0, 0, W, H, 0xff2828, 0.12).setOrigin(0).setScrollFactor(0), D.hurt);
    this.shotTex = bulletTexture(scene, 0xffd25e, 1);
  }

  draw(s: GameState, t: number, v: ViewFlags) {
    for (const k in this.g) this.g[k as keyof typeof this.g].clear();
    // Screen shake: integer camera jitter
    const sh = s.shake, ox = Math.round((rnd() - 0.5) * sh), oy = Math.round((rnd() - 0.5) * sh);
    this.worldCam.setScroll(-ox, -oy);
    this.heroCam.setScroll(-ox, -oy);

    this.drawHazards(s, t);
    this.drawEnemies(s);
    this.drawProjectiles(s, t, v);
    this.drawParticles(s);
    this.drawStrikes(s);
    this.freezeTint.setVisible(s.freeze > 0);
    this.drawHero(s, t, v);
    this.drawRingsAndTexts(s);
    this.drawCanvasUi(s, v);
    this.hurtTint.setVisible(s.P.hurt > 0 && !s.P.dead);
    this.applyFilters(s);
  }

  private applyFilters(s: GameState) {
    if (!this.worldFx || !this.heroFx) return;
    const frozen = s.freeze > 0, inverted = s.invert > 0;
    this.worldFx.active = frozen || inverted;
    this.heroFx.active = inverted;
    const wm = this.worldFx.colorMatrix.reset();
    if (frozen) wm.saturate(-0.85, true);
    if (inverted) wm.negative(true);
    const hm = this.heroFx.colorMatrix.reset();
    if (inverted) hm.negative(true);
  }

  private drawHazards(s: GameState, t: number) {
    const g = this.g.hazards, ga = this.g.hazardsAdd;
    for (const h of s.hazards) {
      if (h.type === 'laser') {
        const x2 = h.x + Math.cos(h.a) * 500, y2 = h.y + Math.sin(h.a) * 500;
        if (h.warn > 0) {
          g.lineStyle(1, 0xffe14d, ((t * 20) | 0) % 2 ? 0.55 : 0.2).lineBetween(h.x, h.y, x2, y2);
        } else {
          ga.lineStyle(9, 0xc8aaff, 0.5).lineBetween(h.x, h.y, x2, y2);
          ga.lineStyle(2, 0xffffff, 1).beginPath().moveTo(h.x, h.y);
          for (let k = 1; k <= 12; k++) { const f = k / 12; ga.lineTo(h.x + (x2 - h.x) * f + (rnd() - 0.5) * 6, h.y + (y2 - h.y) * f + (rnd() - 0.5) * 6); }
          ga.strokePath();
        }
      } else {
        g.lineStyle(3, 0xff8a3c, 0.8).strokeCircle(h.x, h.y, h.r);
        g.lineStyle(1, 0xffde59, 0.4).strokeCircle(h.x, h.y, Math.max(0, h.r - 4));
      }
    }
  }

  private drawEnemies(s: GameState) {
    const pool = this.enemies, ov = this.g.enemyOverlay, glow = this.g.bossGlow;
    pool.begin();
    for (const e of s.enemies) {
      const fl = e.flash > 0, img = pool.next();
      img.setAlpha(1).setRotation(0).setScale(1).setFlipX(false);
      if (e.type === 'missile') {
        img.setTexture(TEX.enemy('missile')).setOrigin(MISSILE_ORIGIN.x, MISSILE_ORIGIN.y).setPosition(e.x, e.y).setRotation(e.ang);
        continue;
      }
      if (e.boss && e.def) {
        const def = e.def, bob = Math.sin(e.t * 3) * 1.5, key = TEX.boss(def.id);
        glow.fillStyle(def.glow, 0.35).fillCircle(e.x, e.y, def.r + 6 + Math.sin(e.t * 5) * 2);
        img.setTexture(fl ? TEX.flash(key) : key).setOrigin(0).setScale(def.scale);
        img.setPosition(Math.round(e.x - (16 * def.scale) / 2), Math.round(e.y + bob - (16 * def.scale) / 2));
        if (def.id === 0) {
          // Égide's shield always faces Omega
          const a = Math.atan2(s.P.y - e.y, s.P.x - e.x), sx = e.x + Math.cos(a) * 12, sy = e.y + bob + Math.sin(a) * 12 + 4;
          ov.fillStyle(fl ? 0xffffff : 0x6b4320).fillCircle(sx, sy, 8);
          ov.fillStyle(fl ? 0xffffff : 0xe0b85a).fillCircle(sx, sy, 6);
          ov.fillStyle(fl ? 0xffffff : 0x2f8a7e).fillCircle(sx, sy, 3.5);
          ov.fillStyle(0xfff6d6).fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 2, 2);
        }
        if (def.id === 3) ov.fillStyle(0x6bf3ff, 0.6 + Math.sin(e.t * 8) * 0.3).fillRect(Math.round(e.x - 6), Math.round(e.y + bob - 10), 12, 2);
        continue;
      }
      const key = TEX.enemy(e.type), frame = this.scene.textures.getFrame(key);
      const yOff = e.type === 'alien' ? Math.sin(e.t * 4) : 0;
      img.setTexture(fl ? TEX.flash(key) : key).setOrigin(0).setFlipX(e.type === 'jet' && e.dir < 0);
      img.setPosition(Math.round(e.x - frame.width / 2), Math.round(e.y + yOff - frame.height / 2));
      if (e.type === 'tank') {
        const tx = e.x + Math.cos(e.ang) * 11, ty = e.y + Math.sin(e.ang) * 11;
        ov.lineStyle(3, fl ? 0xffffff : 0x262b1c).lineBetween(e.x, e.y, tx, ty);
        ov.lineStyle(1, fl ? 0xffffff : 0x7d8c55).lineBetween(e.x, e.y, tx, ty);
      }
      if (e.type === 'alien' && rnd() < 0.5) ov.fillStyle(0xb4ff6b, 0.25).fillRect(Math.round(e.x - 4), Math.round(e.y + 4), 8, 6);
      if (e.hp < e.max && e.max >= 60) {
        const w = 12, x = Math.round(e.x - w / 2), y = Math.round(e.y - e.r - 5);
        ov.fillStyle(0x000000).fillRect(x, y, w, 2);
        ov.fillStyle(0xff5a3c).fillRect(x, y, Math.max(0, (w * e.hp) / e.max) | 0, 2);
      }
    }
    pool.end();
  }

  private drawProjectiles(s: GameState, t: number, v: ViewFlags) {
    const gp = this.ghosts;
    gp.begin();
    for (const gh of s.fx.ghosts) {
      gp.next().setTexture(TEX.flash(TEX.player)).setOrigin(0).setPosition(Math.round(gh.x - 6), Math.round(gh.y - 8)).setAlpha((gh.life / 0.45) * 0.6);
    }
    gp.end();

    this.shots.begin();
    for (const sh of s.shots) this.shots.next().setTexture(this.shotTex).setPosition(sh.x, sh.y);
    this.shots.end();

    this.bullets.begin();
    for (const b of s.bullets) this.bullets.next().setTexture(bulletTexture(this.scene, b.col, b.r)).setPosition(b.x, b.y);
    this.bullets.end();

    const P = s.P;
    if (v.running && !s.over && P.beaming) {
      const g = this.g.beam, bw = s.up.beamW, ca = Math.cos(P.aim), sa = Math.sin(P.aim);
      const x1 = P.x + ca * 6, y1 = P.y + sa * 6, x2 = P.x + ca * BEAM_LEN, y2 = P.y + sa * BEAM_LEN, wob = Math.sin(t * 40) * 1.5;
      g.lineStyle((11 + wob) * bw, 0xffaa32, 0.28).lineBetween(x1, y1, x2, y2);
      g.lineStyle(5 * bw, 0xffdc78, 0.6).lineBetween(x1, y1, x2, y2);
      g.lineStyle(2, 0xfffbe8, 1).lineBetween(x1, y1, x2, y2);
      g.fillStyle(0xfff0c8, 0.8).fillCircle(x1, y1, 4 + wob);
    }
  }

  private drawParticles(s: GameState) {
    const ga = this.g.partsAdd, gn = this.g.parts;
    for (const p of s.fx.parts) {
      if (p.add) ga.fillStyle(p.col, Math.min(1, (p.life / p.max) * 1.5)).fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      else gn.fillStyle(p.col, p.life / p.max).fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    }
  }

  private drawStrikes(s: GameState) {
    const g = this.g.strikes, ga = this.g.strikesAdd;
    for (const st of s.strikes) {
      const k = 1 - st.t / STRIKE_WARN;
      g.lineStyle(1, 0x9be8ff, 0.3 + k * 0.5).strokeCircle(st.x, st.y, 22 * (1 - k * 0.5));
      const sy = st.y - 140 * (1 - k), sx = st.x - 60 * (1 - k);
      ga.lineStyle(2, 0xfff6d6, 0.7).lineBetween(sx - 24, sy - 56, sx, sy);
      ga.fillStyle(0xffffff, 1).fillCircle(sx, sy, 3);
    }
  }

  private drawHero(s: GameState, t: number, v: ViewFlags) {
    const P = s.P;
    this.cloneGlows.begin();
    this.clones.begin();
    if (v.running && !P.dead) {
      for (let i = 0; i < s.up.clones; i++) {
        const [cx, cy] = clonePos(s, i);
        this.cloneGlows.next().setTexture(TEX.glow).setPosition(cx, cy).setDisplaySize(28, 28).setAlpha(0.5);
        this.clones.next().setTexture(TEX.player).setOrigin(0).setPosition(Math.round(cx - 6), Math.round(cy - 8)).setAlpha(0.75);
      }
    }
    this.cloneGlows.end();
    this.clones.end();

    const visible = !P.dead;
    this.playerGlow.setVisible(visible);
    this.player.setVisible(visible);
    if (!visible) return;
    const bob = Math.sin(t * 2.4) * 1.5, py = P.y + bob, gs = 58 + Math.sin(t * 4) * 4;
    this.playerGlow.setPosition(P.x, py).setDisplaySize(gs, gs).setAlpha(0.9);
    const g = this.g.playerFx;
    g.lineStyle(1, 0xffd25e, 0.18 + Math.sin(t * 6) * 0.08).strokeCircle(P.x, py, s.up.auraR + Math.sin(t * 3));
    if (s.up.phase > 0 && s.phaseCd <= 0) g.lineStyle(1, 0x9be8ff, 0.35 + Math.sin(t * 9) * 0.15).strokeCircle(P.x, py, 10);
    for (let i = 0; i < 4; i++) {
      const a = t * 2 + (i * TAU) / 4;
      g.fillStyle(i % 2 ? 0xfff6d6 : 0xffd25e, 1).fillRect(Math.round(P.x + Math.cos(a) * 14), Math.round(py + Math.sin(a) * 7), 1, 1);
    }
    this.player
      .setTexture(P.hurt > 0 ? TEX.flash(TEX.player) : TEX.player)
      .setPosition(Math.round(P.x - 6), Math.round(py - 8))
      .setAlpha(P.inv > 0 && ((t * 20) | 0) % 2 ? 0.45 : 1);
    // Life bar under the feet, Vampire Survivors style
    const bx = Math.round(P.x - 8), by = Math.round(P.y + 11), fill = Math.round(16 * clamp(P.hp / P.max, 0, 1));
    this.g.ui.fillStyle(0x0c0a12, 0.85).fillRect(bx - 1, by - 1, 18, 4)
      .fillStyle(0x4a1020, 1).fillRect(bx, by, 16, 2)
      .fillStyle(0xff3b5c, 1).fillRect(bx, by, fill, 2);
  }

  private drawRingsAndTexts(s: GameState) {
    const g = this.g.rings;
    for (const r of s.fx.rings) {
      const k = r.t / r.dur, rad = r.max * Math.pow(k, 0.6);
      if (!r.small) g.fillStyle(0xffffff, 0.25 * (1 - k)).fillCircle(r.x, r.y, Math.min(rad, r.inner));
      g.lineStyle(r.small ? 2 : 3, 0xffe6a0, 1 - k).strokeCircle(r.x, r.y, rad);
    }
    this.texts.begin();
    for (const tx of s.fx.texts) {
      const o = this.texts.next();
      if (o.text !== tx.txt) o.setText(tx.txt);
      o.setColor('#' + tx.col.toString(16).padStart(6, '0')).setPosition(Math.round(tx.x), Math.round(tx.y) + 2).setAlpha(Math.min(1, tx.life * 2));
    }
    this.texts.end();
  }

  private drawCanvasUi(s: GameState, v: ViewFlags) {
    const g = this.g.ui;
    if (v.joy) {
      const j = v.joy;
      g.lineStyle(1, 0xffd25e, 0.35).strokeCircle(j.ox, j.oy, 28);
      g.fillStyle(0xffd25e, 0.4).fillCircle(j.ox + clamp(j.x - j.ox, -28, 28), j.oy + clamp(j.y - j.oy, -28, 28), 9);
    }
    if (!v.touch && v.running && !s.over) {
      const mx = Math.round(v.mouseX), my = Math.round(v.mouseY);
      g.fillStyle(0xfff6d6, 0.85);
      g.fillRect(mx - 4, my, 3, 1).fillRect(mx + 2, my, 3, 1).fillRect(mx, my - 4, 1, 3).fillRect(mx, my + 2, 1, 3);
    }
  }
}
