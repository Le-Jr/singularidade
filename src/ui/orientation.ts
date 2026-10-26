// Landscape on phones. The game only exists in 16:9: on a touch device held upright the whole #wrap is rotated 90°
// with CSS (.rot) and Phaser's pointer mapping is patched to undo the rotation. Where the browser allows it (Android),
// starting a run also goes fullscreen and locks the screen to landscape, so the CSS rotation is not needed there.
import type Phaser from 'phaser';

const coarse = matchMedia('(pointer:coarse)');

/** Touch device in portrait: the game is drawn rotated. */
export const isRotated = () => coarse.matches && innerHeight > innerWidth;

/** Must be called from a user gesture (click). Fails silently on iOS and desktop. */
export async function lockLandscape() {
  if (!coarse.matches) return;
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
  } catch {
    // No fullscreen/orientation lock: the CSS rotation covers it
  }
}

/** Makes Phaser's scale and input work inside the rotated #wrap. */
export function patchForRotation(game: Phaser.Game, wrap: HTMLElement) {
  const sm = game.scale;
  // getBoundingClientRect returns the rotated box; the layout size is what FIT must fill
  sm.getParentBounds = () => {
    const stage = sm.parent as HTMLElement | null;
    if (!stage) return false;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (sm.parentSize.width === w && sm.parentSize.height === h) return false;
    sm.parentSize.setSize(w, h);
    return true;
  };
  // Rotated 90° clockwise: the canvas's x axis runs down the screen and its y axis runs right to left
  const im = game.input, transform = im.transformPointer.bind(im);
  im.transformPointer = (p, pageX, pageY, wasMove) => {
    if (!wrap.classList.contains('rot')) return transform(p, pageX, pageY, wasMove);
    // canvasBounds and displayScale come from the rotated on-screen box, so they are swapped: map to game units here,
    // then hand Phaser the page coordinates that its own unrotated math turns back into them (keeps pointer smoothing)
    const b = sm.canvasBounds, ds = sm.displayScale;
    const gx = ((pageY - b.y) * sm.baseSize.width) / b.height, gy = ((b.x + b.width - pageX) * sm.baseSize.height) / b.width;
    transform(p, b.x + gx / ds.x, b.y + gy / ds.y, wasMove);
  };
}
