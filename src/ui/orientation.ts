// Landscape only on phones. Held upright, a "rotate your phone" screen covers the game (CSS, #rotate) and the run
// pauses. Starting a run goes fullscreen and, where the browser allows it (Android), locks the screen to landscape.

/** Touch device held upright. */
export const portraitTouch = matchMedia('(pointer:coarse) and (orientation:portrait)');

/** Must be called from a user gesture (click). Fails silently on iOS and desktop. */
export async function lockLandscape() {
  if (!matchMedia('(pointer:coarse)').matches) return;
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
  } catch {
    // No fullscreen/orientation lock: the rotate screen covers portrait
  }
}
