// Rasterizes ICON_ART to data URLs once, for <img> tags in the DOM HUD (scaled up with image-rendering: pixelated).
import { ICON_ART } from '../render/art.ts';

const cache = new Map<string, string>();

export function iconUrl(key: string): string {
  let url = cache.get(key);
  if (url) return url;
  const art = ICON_ART[key];
  if (!art) return '';
  const c = document.createElement('canvas');
  c.width = Math.max(...art.rows.map(r => r.length));
  c.height = art.rows.length;
  const x = c.getContext('2d')!;
  art.rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const p = art.pal[row[i]];
      if (!p) continue;
      x.fillStyle = p;
      x.fillRect(i, j, 1, 1);
    }
  });
  url = c.toDataURL();
  cache.set(key, url);
  return url;
}

export function icon(key: string, cls = 'ico'): HTMLImageElement {
  const img = document.createElement('img');
  img.className = cls;
  img.alt = '';
  img.src = iconUrl(key);
  return img;
}
