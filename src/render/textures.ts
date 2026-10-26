// Builds every texture procedurally at boot (no image files): sprites, flash silhouettes, bullets, ground, glow, vignette.
import Phaser from 'phaser';
import { H, TAU, W } from '../sim/util.ts';
import { BOSS_PALETTES, ENEMY_ART, BOSS_ROWS, PLAYER, type PixelArt } from './art.ts';

export const TEX = {
  player: 'spr:player',
  enemy: (type: string) => 'spr:' + type,
  boss: (id: number) => 'spr:boss' + id,
  /** White silhouette used for the 60 ms hit flash. */
  flash: (key: string) => key + ':flash',
  ground: 'ground',
  glow: 'glow',
  vignette: 'vignette',
};

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function addSprite(scene: Phaser.Scene, key: string, art: PixelArt) {
  const w = Math.max(...art.rows.map(r => r.length)), h = art.rows.length;
  const [c, x] = canvas(w, h);
  art.rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const p = art.pal[row[i]];
      if (!p) continue;
      x.fillStyle = p;
      x.fillRect(i, j, 1, 1);
    }
  });
  const [f, fx] = canvas(w, h);
  fx.drawImage(c, 0, 0);
  fx.globalCompositeOperation = 'source-in';
  fx.fillStyle = '#fff';
  fx.fillRect(0, 0, w, h);
  scene.textures.addCanvas(key, c);
  scene.textures.addCanvas(TEX.flash(key), f);
}

const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

/** Radial-gradient bullet texture, created on first use per color/radius. */
export function bulletTexture(scene: Phaser.Scene, col: number, r: number): string {
  const key = `blt:${col}:${r}`;
  if (scene.textures.exists(key)) return key;
  const s = Math.ceil((r + 3) * 2) + 1, m = s / 2;
  const [c, x] = canvas(s, s);
  const g = x.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(Math.min(0.85, (r * 0.7) / m), hex(col));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.beginPath();
  x.arc(m, m, m, 0, TAU);
  x.fill();
  scene.textures.addCanvas(key, c);
  return key;
}

function addGround(scene: Phaser.Scene) {
  const rnd = Math.random;
  const [c, g] = canvas(W, H);
  g.fillStyle = '#16121e';
  g.fillRect(0, 0, W, H);
  const noise = ['#1b1624', '#120f19', '#1e1829', '#191421'];
  for (let i = 0; i < 5200; i++) { g.fillStyle = noise[(rnd() * 4) | 0]; g.fillRect((rnd() * W) | 0, (rnd() * H) | 0, rnd() < 0.2 ? 2 : 1, 1); }
  g.fillStyle = 'rgba(155,123,255,0.05)';
  for (let x = 0; x < W; x += 25) g.fillRect(x, 0, 1, H);
  for (let y = 0; y < H; y += 25) g.fillRect(0, y, W, 1);
  // Craters
  for (let i = 0; i < 13; i++) {
    const cx = rnd() * W, cy = rnd() * H, r = 5 + rnd() * 15;
    g.fillStyle = '#0e0b14';
    g.beginPath(); g.ellipse(cx, cy, r, r * 0.6, 0, 0, TAU); g.fill();
    g.strokeStyle = '#2c2338'; g.lineWidth = 1;
    g.beginPath(); g.ellipse(cx, cy + 1, r + 1, r * 0.6 + 1, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  }
  // Cracks
  g.strokeStyle = '#0d0a12';
  for (let i = 0; i < 14; i++) {
    let x = rnd() * W, y = rnd() * H;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (rnd() - 0.5) * 18; y += (rnd() - 0.5) * 18; g.lineTo(x, y); }
    g.stroke();
  }
  for (let i = 0; i < 40; i++) { g.fillStyle = rnd() < 0.5 ? '#2a2233' : '#0f0c16'; g.fillRect((rnd() * W) | 0, (rnd() * H) | 0, 2 + ((rnd() * 3) | 0), 2); }
  g.font = 'bold 22px monospace'; g.fillStyle = 'rgba(255,210,94,0.05)'; g.textAlign = 'center';
  g.fillText('ZONA DE TESTE 7', W / 2, H / 2 + 8);
  // Hazard stripes
  g.fillStyle = 'rgba(255,90,60,0.06)';
  for (let i = 0; i < 10; i++) { g.fillRect(i * 8, H - 6, 4, 6); g.fillRect(W - 80 + i * 8, 0, 4, 6); }
  scene.textures.addCanvas(TEX.ground, c);
}

function addGlow(scene: Phaser.Scene) {
  const [c, x] = canvas(64, 64);
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,230,150,.55)');
  g.addColorStop(0.4, 'rgba(255,190,70,.18)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  scene.textures.addCanvas(TEX.glow, c);
}

function addVignette(scene: Phaser.Scene) {
  const [c, x] = canvas(W, H);
  const g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.6)');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  scene.textures.addCanvas(TEX.vignette, c);
}

export function buildTextures(scene: Phaser.Scene) {
  addSprite(scene, TEX.player, PLAYER);
  for (const [type, art] of Object.entries(ENEMY_ART)) addSprite(scene, TEX.enemy(type), art);
  BOSS_PALETTES.forEach((pal, id) => addSprite(scene, TEX.boss(id), { rows: BOSS_ROWS[id], pal }));
  addGround(scene);
  addGlow(scene);
  addVignette(scene);
}
