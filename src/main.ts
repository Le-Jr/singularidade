import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.ts';
import { H, W } from './sim/util.ts';
import { isRotated, patchForRotation } from './ui/orientation.ts';
import './style.css';

const stage = document.getElementById('stage')!;
const wrap = document.getElementById('wrap')!;

/** Size #stage to the largest 16:9 box that fits and expose --u (CSS px per game unit) for the HUD. */
function fit() {
  // Phones held upright get the game rotated sideways (see ui/orientation.ts); sizes below are pre-rotation
  const rot = isRotated();
  wrap.classList.toggle('rot', rot);
  wrap.style.width = rot ? innerHeight + 'px' : '';
  wrap.style.height = rot ? innerWidth + 'px' : '';
  const w = Math.max(200, Math.min(wrap.clientWidth, ((wrap.clientHeight - 20) * 16) / 9));
  stage.style.width = w + 'px';
  stage.style.height = (w * 9) / 16 + 'px';
  stage.style.setProperty('--u', w / W + 'px');
}
fit();

const game = new Phaser.Game({
  // WebGL is required: a custom canvas needs an explicit renderer, and the time-stop/erase effects use camera filters
  type: Phaser.WEBGL,
  canvas: document.getElementById('game') as HTMLCanvasElement,
  width: W,
  height: H,
  pixelArt: true,
  backgroundColor: '#000000',
  disableContextMenu: true,
  banner: false,
  audio: { noAudio: true },
  input: { activePointers: 3 },
  scale: { mode: Phaser.Scale.FIT, parent: stage, expandParent: false, autoCenter: Phaser.Scale.NO_CENTER },
  scene: [GameScene],
});

patchForRotation(game, wrap);

addEventListener('resize', () => {
  fit();
  game.scale.refresh();
});
