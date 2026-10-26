// The only scene: owns the run flow (menu → play → pause/evolution → game over) and wires sim, view, input, audio and HUD.
import Phaser from 'phaser';
import { Synth } from '../audio/Synth.ts';
import { Controls } from '../input/Controls.ts';
import { buildTextures } from '../render/textures.ts';
import { WorldView } from '../render/WorldView.ts';
import { Sim, STEP } from '../sim/Sim.ts';
import type { SimEvent } from '../sim/types.ts';
import { Hud } from '../ui/Hud.ts';
import { lockLandscape } from '../ui/orientation.ts';
import { loadBest, saveBest } from '../ui/storage.ts';

/** Max fixed steps per rendered frame, so a long hitch doesn't spiral. */
const MAX_STEPS = 4;

export class GameScene extends Phaser.Scene {
  private sim = new Sim();
  private view!: WorldView;
  private controls!: Controls;
  private hud = new Hud();
  private synth = new Synth();
  private running = false;
  private paused = false;
  private overShown = false;
  private acc = 0;
  private best = loadBest();

  constructor() { super('game'); }

  create() {
    buildTextures(this);
    this.view = new WorldView(this);
    this.controls = new Controls(this, {
      isRunning: () => this.running,
      isChoosing: () => this.sim.s.choosing,
      onPause: () => { if (this.running && !this.sim.s.over) this.togglePause(); },
      onMute: () => {
        this.synth.init();
        this.hud.showBanner(this.synth.toggleMute() ? 'Som desligado' : 'Som ligado', '', 0.9);
      },
      onChoose: i => this.choose(i),
      onBlur: () => { if (this.running && !this.sim.s.over && !this.paused && !this.sim.s.choosing) this.togglePause(); },
      onTouchMode: () => this.hud.setTouch(),
    });
    this.hud.setBest(this.best);
    // Starting from a tap is the user gesture that fullscreen and the landscape lock need
    for (const id of ['startBtn', 'againBtn']) document.getElementById(id)!.addEventListener('click', () => { lockLandscape(); this.start(); });
    document.getElementById('resumeBtn')!.addEventListener('click', () => this.togglePause());
    // Debug handle for the console and automated playtests: window.__singularidade.sim.s
    (window as unknown as Record<string, unknown>).__singularidade = this;
  }

  get state() { return this.sim.s; }

  start(seed?: number) {
    this.synth.init();
    this.sim = new Sim(seed);
    this.running = true;
    this.paused = false;
    this.overShown = false;
    this.acc = 0;
    this.controls.reset();
    this.hud.hideOverlays();
    this.hud.hideBoss();
    this.hud.setThreat(this.sim.s.threat);
    this.hud.showBanner('Ômega desperta', 'Sobreviva o máximo que puder', 2.2);
  }

  private togglePause() {
    this.paused = !this.paused;
    this.hud.setPaused(this.paused);
  }

  private choose(i: number) {
    if (this.sim.chooseUpgrade(i)) this.hud.closeUpgrade();
  }

  update(_time: number, deltaMs: number) {
    const s = this.sim.s, dt = Math.min(0.1, deltaMs / 1000);
    const active = this.running && !this.paused && !s.choosing;
    if (active) {
      this.acc += dt;
      let n = 0;
      while (this.acc >= STEP && n < MAX_STEPS && !s.choosing) {
        this.sim.step(STEP, this.controls.sample());
        this.acc -= STEP;
        n++;
      }
      if (n === MAX_STEPS) this.acc = 0;
      this.handle(this.sim.drain());
      this.hud.tick(dt);
      this.hud.sync(s);
    } else this.acc = 0;

    this.synth.setBeam(active && !s.over && s.P.beaming);
    const c = this.controls;
    this.view.draw(s, this.time.now / 1000, { running: this.running, touch: c.touch, mouseX: c.mouse.x, mouseY: c.mouse.y, joy: c.joy });
  }

  private handle(events: SimEvent[]) {
    for (const e of events) {
      switch (e.type) {
        case 'sfx': this.synth.play(e.key); break;
        case 'banner': this.hud.showBanner(e.title, e.sub, e.dur); break;
        case 'threat': this.hud.setThreat(e.name); break;
        case 'boss-spawn': this.hud.showBoss(e.name); break;
        case 'boss-down': this.hud.hideBoss(); break;
        case 'upgrade-offer':
          this.controls.releaseHolds();
          this.hud.openUpgrade(e.reason, e.cards, this.sim.s.lv, i => this.choose(i));
          break;
        case 'game-over': this.showOver(); break;
      }
    }
  }

  private showOver() {
    if (this.overShown) return;
    this.overShown = true;
    const s = this.sim.s, isBest = s.score > this.best;
    if (isBest) { this.best = s.score; saveBest(this.best); }
    this.hud.showOver(s, this.best, isBest);
  }
}
