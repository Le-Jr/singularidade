// Automated visual playtest: drives the real game in headless Chromium and saves screenshots to .playtest/.
// Usage: npm run dev (other terminal), then npm run playtest [-- http://localhost:5173/]
// Needs a local Chromium/Chrome; set CHROME_PATH if it is not at a standard location.
import { existsSync, mkdirSync } from 'node:fs';
import { chromium, type Page } from 'playwright-core';

const url = process.argv[2] ?? 'http://localhost:5173/';
const out = '.playtest';
const candidates = [process.env.CHROME_PATH, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const executablePath = candidates.find(p => p && existsSync(p));
if (!executablePath) throw new Error('No Chromium found. Set CHROME_PATH.');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors: string[] = [];
const watch = (p: Page) => {
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
};
/** Evaluates `expr` in the page with `g` = the debug handle exposed by GameScene (g.state is the GameState). */
const game = (p: Page, expr: string) => p.evaluate(`(g => (${expr}))(window.__singularidade)`);
const shot = (p: Page, name: string) => p.screenshot({ path: `${out}/${name}.png` });

// Desktop run
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
watch(page);
await page.goto(url);
await page.waitForTimeout(1200);
await shot(page, '01-menu');
await page.click('#startBtn');
await page.mouse.move(900, 300);
await page.keyboard.down('d');
await page.waitForTimeout(1000);
await page.keyboard.up('d');
await page.mouse.down();
await page.waitForTimeout(700);
await shot(page, '02-beam');
await page.mouse.up();
await page.keyboard.press(' ');
await page.waitForTimeout(50);
await shot(page, '03-erase');
// Fast-forward to the first hero with every unlockable power
await game(page, 'Object.assign(g.state.up, { time: 1, clones: 2, meteor: 2, phase: 1 }), Object.assign(g.state.lv, { time: 1, clone: 2, meteor: 2, phase: 1, beam: 1, aura: 4, regen: 2 }), g.state.P.max = g.state.P.hp = 1e9, g.state.t = 69.5');
await page.waitForTimeout(3500);
await shot(page, '04-boss');
await page.keyboard.press('q');
await page.waitForTimeout(300);
await shot(page, '05-timestop');
await game(page, "g.state.pendingUp = 1, g.state.upDelay = 0, g.state.upReason.push('Playtest')");
await page.waitForTimeout(500);
await shot(page, '06-upgrade');
await page.keyboard.press('1');
await game(page, 'g.state.P.max = 1000, g.state.P.hp = 1, g.state.P.inv = 0, g.state.up.phase = 0');
await page.waitForTimeout(5000);
await shot(page, '07-over');
const stats = await game(page, '({ t: g.state.t, kills: g.state.kills, over: g.state.over, fps: Math.round(g.game.loop.actualFps) })');

// Phone run (touch controls)
const phone = await (await browser.newContext({ viewport: { width: 740, height: 360 }, hasTouch: true, isMobile: true })).newPage();
watch(phone);
await phone.goto(url);
await phone.waitForTimeout(800);
await phone.tap('#startBtn');
await phone.waitForTimeout(2000);
await game(phone, 'g.state.up.time = 1, Object.assign(g.state.lv, { time: 1, aura: 2 })');
await phone.tap('#mErase');
await phone.waitForTimeout(600);
await shot(phone, '08-mobile');
await game(phone, "g.state.pendingUp = 1, g.state.upDelay = 0, g.state.upReason.push('Playtest')");
await phone.waitForTimeout(500);
await shot(phone, '09-mobile-upgrade');

// Phone held upright: the game is rotated 90° with CSS and touch must still land on the right game coordinate
const tall = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
watch(tall);
await tall.goto(url);
await tall.waitForTimeout(800);
await shot(tall, '10-portrait-menu');
await tall.tap('#startBtn');
await tall.waitForTimeout(1500);
const r = await tall.evaluate(() => document.querySelector('canvas')!.getBoundingClientRect().toJSON()) as DOMRect;
const k = r.height / 400; // rotated: the canvas's 400-unit width runs down the screen
await tall.touchscreen.tap(r.right - 50 * k, r.top + 100 * k);
const ptr = await game(tall, '({ x: Math.round(g.input.activePointer.x), y: Math.round(g.input.activePointer.y) })') as { x: number; y: number };
if (Math.abs(ptr.x - 100) > 2 || Math.abs(ptr.y - 50) > 2) errors.push(`portrait touch mapped to ${ptr.x},${ptr.y}, expected 100,50`);
await shot(tall, '11-portrait-play');

await browser.close();
console.log('stats', JSON.stringify(stats));
console.log(`screenshots in ${out}/`);
if (errors.length) {
  console.error('console errors:\n' + errors.join('\n'));
  process.exit(1);
}
