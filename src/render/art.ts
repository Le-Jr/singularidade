// Pixel art as data: each string is a row, each char maps to a palette color, '.' is transparent.
// See .claude/skills/pixel-art-and-sfx for the art rules.

export interface PixelArt { rows: string[]; pal: Record<string, string> }

export const PLAYER: PixelArt = {
  rows: [
    '....oooo....',
    '...oyyyyo...',
    '...yyyyyy...',
    '...ywyywy...',
    '...yyyyyy...',
    '....yddy....',
    '..yyyyyyyy..',
    '.yyyYYYYyyy.',
    '.yy.YwwY.yy.',
    '.yy.yYYy.yy.',
    '.y..yyyy..y.',
    '....yyyy....',
    '....yy.yy...',
    '...yy...yy..',
    '...yy...yy..',
    '..ddd...ddd.',
  ],
  pal: { o: '#fff6d6', y: '#ffd25e', Y: '#ffe9a8', d: '#c98f2a', w: '#ffffff' },
};

export const ENEMY_ART: Record<string, PixelArt> = {
  soldier: {
    rows: ['..gggg..', '.gGGGGg.', '..ssss..', '..skks..', '.gggggg.', 'gggggggk', 'g.ggggkk', '..gggg..', '..g..g..', '.kk..kk.'],
    pal: { g: '#4f6b2f', G: '#6d8b3c', s: '#e0b48a', k: '#22201c' },
  },
  agent: {
    rows: ['..hhhh..', '.hhhhhh.', '.ssssss.', '.kkkkkk.', '..ssss..', '.bbwwbb.', 'bbbwrbbb', 'b.bbbb.b', '..bbbb..', '..b..b..'],
    pal: { h: '#1a1a1a', s: '#d8a27e', k: '#050505', b: '#202230', w: '#e9e9e9', r: '#b0182a' },
  },
  mason: {
    rows: ['...pp...', '..pppp..', '.pPPPPp.', '.pPkkPp.', '.pPPPPp.', '.pppppp.', 'pppyyppp', 'pppppppp', 'pPpppPpp', '.pppppp.', 'pp.pp.pp'],
    pal: { p: '#3b2350', P: '#5a3678', k: '#ff4a6a', y: '#d8b04a' },
  },
  tank: {
    rows: [
      '.kkkkkkkkkkkkkk.',
      'kttttttttttttttk',
      'kTTTTTTTTTTTTTTk',
      'kTTTmmmmmmmmTTTk',
      'kTTmMMMMMMMMmTTk',
      'kTTmMMMMMMMMmTTk',
      'kTTmMMMMMMMMmTTk',
      'kTTTmmmmmmmmTTTk',
      'kTTTTTTTTTTTTTTk',
      'kttttttttttttttk',
      '.kkkkkkkkkkkkkk.',
    ],
    pal: { k: '#1a1d14', t: '#2e3324', T: '#56603c', m: '#3f4a2a', M: '#6c7a47' },
  },
  jet: {
    rows: [
      '......w.........',
      '.....ww.........',
      'kk..wwww........',
      'kkwwwwwwwwwwww..',
      '.wWWWWWWWWWWWwcc',
      'kkwwwwwwwwwwww..',
      'kk..wwww........',
      '.....ww.........',
      '......w.........',
    ],
    pal: { w: '#7d889c', W: '#a9b3c4', k: '#4a5262', c: '#6be0ff' },
  },
  alien: {
    rows: ['.....aaaa.....', '....aAAAAa....', '...aAgAAgAa...', '..vvvvvvvvvv..', '.vVVlVVlVVlVv.', 'vvvvvvvvvvvvvv', '..vvvvvvvvvv..', '....l.l.l.l...'],
    pal: { a: '#5be38c', A: '#9dffbf', g: '#0b2a15', v: '#5d6a7c', V: '#9aa7b8', l: '#b4ff6b' },
  },
  // Pointing right; the pivot is column 4, row 2 (see MISSILE_ORIGIN).
  missile: {
    rows: ['kk.......', 'kkgggggrr', 'kkgggggrr', 'kk.......'],
    pal: { k: '#5a5f66', g: '#9aa0a8', r: '#ff3b3b' },
  },
};
export const MISSILE_ORIGIN = { x: 4 / 9, y: 2 / 4 };

/** Shared 16×16 hero template, recolored per boss. */
export const HERO_ROWS = [
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hsssssshh...',
  '....seesseesh...',
  '....ssssssss....',
  '.....ssssss.....',
  '..cCCCCCCCCCCc..',
  '.cCCCaaaaaaCCCc.',
  'cCCCCCaaaaCCCCCc',
  'cCC.CCCCCCCC.CCc',
  'cCC.CCCCCCCC.CCc',
  'cSS.CCaaaaCC.SSc',
  'c...llllllll...c',
  'c...lll..lll...c',
  '....lll..lll....',
  '...bbbb..bbbb...',
];

/** Palettes indexed by boss id (sim/data/bosses.ts). */
export const BOSS_PALETTES: Record<string, string>[] = [
  { h: '#1f5c56', s: '#d6a27a', e: '#fff', c: '#7a4a22', C: '#2f8a7e', a: '#e0b85a', S: '#e0b85a', l: '#1d4a45', b: '#6b4320' },
  { h: '#ffe14d', s: '#e8c0a0', e: '#c7f6ff', c: '#3a1f6b', C: '#7b4dff', a: '#ffe14d', S: '#b39bff', l: '#4b2c99', b: '#2b1a52' },
  { h: '#3a0e10', s: '#c4483a', e: '#ffde59', c: '#5a1214', C: '#a8231f', a: '#ff8a3c', S: '#c4483a', l: '#5c1513', b: '#2a0a0a' },
  { h: '#c9d3e0', s: '#c9d3e0', e: '#6bf3ff', c: '#3b4659', C: '#9aa8bd', a: '#6bf3ff', S: '#dfe7f2', l: '#5d6a80', b: '#2e3646' },
];

// 8×8 HUD icons (DOM, rasterized by src/ui/icons.ts). One per evolution id, plus HUD glyphs.
const GOLD = { y: '#c98f2a', Y: '#ffd25e', W: '#fff6d6' };
const HEART_ROWS = ['.rr..rr.', 'rWRrrRRr', 'rRRRRRRr', 'rRRRRRRr', '.rRRRRr.', '..rRRr..', '...rr...', '........'];

export const ICON_ART: Record<string, PixelArt> = {
  beam: { rows: ['.......Y', '......YW', '.....YW.', '....YW..', '...YW...', '..YW....', '.yy.....', 'yy......'], pal: GOLD },
  erase: {
    rows: ['..vvvv..', '.vVVVVv.', 'vVkkkkVv', 'vVkkkkVv', 'vVkkkkVv', 'vVkkkkVv', '.vVVVVv.', '..vvvv..'],
    pal: { v: '#5a3c9e', V: '#9b7bff', k: '#0c0a12' },
  },
  tp: { rows: ['........', '....W...', '....WW..', 'y.Y.WWW.', 'y.Y.WWWW', 'y.Y.WWW.', '....WW..', '....W...'], pal: GOLD },
  time: {
    rows: ['dddddddd', '.cYYYYc.', '..cYYc..', '...cc...', '...cc...', '..cYYc..', '.cYYYYc.', 'dddddddd'],
    pal: { d: '#c98f2a', c: '#9be8ff', Y: '#ffd25e' },
  },
  clone: { rows: ['.YY..yy.', '.YY..yy.', 'YYYYyyyy', '.YY..yy.', '.YY..yy.', '.Y.Y.y.y', '.Y.Y.y.y', '........'], pal: GOLD },
  meteor: { rows: ['y.......', '.y......', '..y.....', '...y.Y..', '....YWY.', '...YWWWY', '....YWY.', '.....Y..'], pal: GOLD },
  phase: {
    rows: ['.cccccc.', 'cCCCCCCc', 'cCWCCCCc', 'cCCCCCCc', 'cCCCCCCc', '.cCCCCc.', '..cCCc..', '...cc...'],
    pal: { c: '#3a8fb0', C: '#9be8ff', W: '#ffffff' },
  },
  bolts: { rows: ['..yYWW..', '........', 'yYWW....', '........', '..yYWW..', '........', 'yYWW....', '........'], pal: GOLD },
  aura: {
    rows: ['..e..e..', 'e.oooo.e', '.oYYYYo.', '.oYWWYo.', '.oYWWYo.', '.oYYYYo.', 'e.oooo.e', '..e..e..'],
    pal: { e: '#ff5a3c', o: '#ff8a3c', Y: '#ffd25e', W: '#fff6d6' },
  },
  body: { rows: HEART_ROWS, pal: { r: '#c98f2a', R: '#ffd25e', W: '#fff6d6' } },
  regen: {
    rows: ['..gGGg..', '..gGGg..', 'gggGGggg', 'GGGWWGGG', 'GGGWWGGG', 'gggGGggg', '..gGGg..', '..gGGg..'],
    pal: { g: '#3fae6a', G: '#9dffbf', W: '#ffffff' },
  },
  heart: { rows: HEART_ROWS, pal: { r: '#b0182a', R: '#ff3b5c', W: '#ffd0d8' } },
  skull: {
    rows: ['..wwww..', '.wwwwww.', 'wwwwwwww', 'wkkwwkkw', 'wkkwwkkw', 'wwwkkwww', '.wwwwww.', '.wdwdwd.'],
    pal: { w: '#f1e8d4', k: '#0c0a12', d: '#8a7fa0' },
  },
  star: { rows: ['...yy...', '...YY...', 'yyYWWYyy', '.yYWWYy.', '..yYYy..', '.yY..Yy.', '.y....y.', '........'], pal: GOLD },
};
