// DOM HUD and overlays (menu, pause, evolution cards, game over) drawn over the canvas.
// Markup lives in index.html, styles in src/style.css. Text scales with the CSS variable --u.
import { xpToNext } from '../sim/state.ts';
import type { GameState, UpgradeCard } from '../sim/types.ts';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

export const fmtTime = (sec: number) => {
  const s = Math.floor(sec);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};
const fmtNum = (n: number) => n.toLocaleString('pt-BR');

export class Hud {
  private bannerT = 0;
  private el = {
    hpBar: $('hpBar'), hpTxt: $('hpTxt'), lvlTxt: $('lvlTxt'), xpBar: $('xpBar'),
    time: $('time'), score: $('scoreTxt'), kills: $('killTxt'),
    bossBox: $('bossBox'), bossName: $('bossName'), bossBar: $('bossBar'),
    threat: $('threatTxt'),
    cdErase: $('cdErase'), pwErase: $('pwErase'), cdTp: $('cdTp'), pwTp: $('pwTp'), cdTime: $('cdTime'), pwTime: $('pwTime'),
    mErase: $('mErase'), mTp: $('mTp'), mTime: $('mTime'),
    banner: $('banner'), bTitle: $('bTitle'), bSub: $('bSub'),
    menu: $('menu'), pause: $('pauseOv'), up: $('upOv'), upKick: $('upKick'), upList: $('upList'), over: $('overOv'),
    best: $('bestTxt'), best2: $('bestTxt2'),
  };
  private touch = false;

  setTouch() {
    this.touch = true;
    $('mob').hidden = false;
    $('powers').style.display = 'none';
    $('ctlDesk').hidden = true;
    $('ctlMob').hidden = false;
  }

  showBanner(title: string, sub = '', dur = 2.4) {
    this.el.bTitle.textContent = title;
    this.el.bSub.textContent = sub;
    this.el.banner.classList.add('on');
    this.bannerT = dur;
  }

  /** Advances UI timers. Only called while the game is running, so banners freeze on pause like the world. */
  tick(dt: number) {
    if (this.bannerT > 0 && (this.bannerT -= dt) <= 0) this.el.banner.classList.remove('on');
  }

  sync(s: GameState) {
    const P = s.P, el = this.el;
    el.hpBar.style.width = (P.hp / P.max) * 100 + '%';
    el.hpTxt.textContent = String(Math.ceil(P.hp));
    el.lvlTxt.textContent = 'Nv ' + s.lvl;
    el.xpBar.style.width = Math.min(100, (s.xp / xpToNext(s.lvl)) * 100) + '%';
    el.time.textContent = fmtTime(s.t);
    el.score.textContent = fmtNum(s.score);
    el.kills.textContent = String(s.kills);
    if (s.boss) el.bossBar.style.width = Math.max(0, (s.boss.hp / s.boss.max) * 100) + '%';
    el.cdErase.style.transform = `scaleX(${P.erCd / s.up.eraseCd})`;
    el.pwErase.classList.toggle('wait', P.erCd > 0);
    el.cdTp.style.transform = `scaleX(${P.tpCd / s.up.tpCd})`;
    el.pwTp.classList.toggle('wait', P.tpCd > 0);
    const hasTime = s.up.time > 0;
    el.pwTime.hidden = !hasTime;
    el.mTime.hidden = !hasTime;
    if (hasTime) {
      el.cdTime.style.transform = `scaleX(${s.tsCd / s.tsMax})`;
      el.pwTime.classList.toggle('wait', s.tsCd > 0);
    }
    if (this.touch) {
      el.mErase.style.opacity = P.erCd > 0 ? '.45' : '1';
      el.mTp.style.opacity = P.tpCd > 0 ? '.45' : '1';
      el.mTime.style.opacity = s.tsCd > 0 ? '.45' : '1';
    }
  }

  setThreat(name: string) { this.el.threat.textContent = name; }

  showBoss(name: string) {
    this.el.bossBox.hidden = false;
    this.el.bossName.textContent = name;
    this.el.bossBar.style.width = '100%';
  }
  hideBoss() { this.el.bossBox.hidden = true; }


  openUpgrade(reason: string, cards: UpgradeCard[], onPick: (i: number) => void) {
    this.el.upKick.textContent = reason;
    const list = this.el.upList;
    list.replaceChildren();
    cards.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'upc';
      const tag = document.createElement('span');
      tag.className = 'tag' + (c.isNew ? ' new' : '');
      tag.textContent = c.isNew ? 'Novo poder' : `Nível ${c.level + 1} de ${c.max}`;
      const h = document.createElement('h3');
      h.textContent = c.name;
      const p = document.createElement('p');
      p.textContent = c.desc;
      b.append(tag, h, p);
      if (!this.touch) {
        const k = document.createElement('span');
        k.className = 'key';
        k.textContent = 'Tecla ' + (i + 1);
        b.append(k);
      }
      b.addEventListener('click', () => onPick(i));
      list.append(b);
    });
    this.el.up.hidden = false;
    (list.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
  }
  closeUpgrade() { this.el.up.hidden = true; }

  setPaused(p: boolean) { this.el.pause.hidden = !p; }

  hideOverlays() {
    for (const o of [this.el.menu, this.el.over, this.el.pause, this.el.up]) o.hidden = true;
  }

  setBest(best: number) {
    const t = best ? 'Recorde: ' + fmtNum(best) + ' pontos' : '';
    this.el.best.textContent = t;
    this.el.best2.textContent = t;
  }

  showOver(s: GameState, best: number, isBest: boolean) {
    $('oTime').textContent = fmtTime(s.t);
    $('oKills').textContent = String(s.kills);
    $('oErased').textContent = String(s.erased);
    $('oHeroes').textContent = String(s.heroes);
    $('oLvl').textContent = String(s.lvl);
    $('oScore').textContent = fmtNum(s.score);
    this.setBest(best);
    if (isBest) this.el.best2.textContent = 'Novo recorde!';
    this.el.over.hidden = false;
    this.hideBoss();
  }
}
