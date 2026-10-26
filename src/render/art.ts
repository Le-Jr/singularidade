// Hand-authored pixel clusters: '.' is transparent; each character is one pixel.
export interface PixelArt { rows: string[]; pal: Record<string, string> }

// Keep the 12×16 footprint: clones, ghosts and the player share this origin.
export const PLAYER: PixelArt = {
  rows: [
    '....kkkk....',
    '...kWYYyk...',
    '...kYWWyk...',
    '...kweewk...',
    '....kYyk....',
    '...kdYydk...',
    '..kYWYYWyk..',
    '.kYykWWkyyk.',
    '.kYkYWWYkdk.',
    '.kwkdYYdkwk.',
    '..k.kYYk.k..',
    '....kddk....',
    '...kYkkYk...',
    '...kykkyk...',
    '..kydkkdyk..',
    '..kkkkkkkk..',
  ],
  pal: { k: '#392638', d: '#9e5836', y: '#db973e', Y: '#ffd25e', W: '#fff1bc', w: '#fffceb', e: '#624160' },
};

export const ENEMY_ART: Record<string, PixelArt> = {
  soldier: {
    rows: ['..kkkk..', '.kgGGgk.', 'kgGggggk', '.ksesk..', '.kgggkk.', 'kgGgkMMk', 'kgkgkmmk', '..kggkk.', '..gkkg..', '.kk..kk.'],
    pal: { k: '#1c2028', g: '#526047', G: '#96a16b', s: '#c7a485', e: '#514550', M: '#a5a5a1', m: '#575d68' },
  },
  agent: {
    rows: ['..kkkk..', '.khhhhk.', '.kssssk.', '.kekkek.', '..kssk..', '.kbwrbk.', 'kbBwrbbk', 'kskbbksk', '..bkkb..', '.kk..kk.'],
    pal: { k: '#151522', h: '#343345', s: '#c5a291', e: '#080e1c', b: '#34364e', B: '#656b83', w: '#d3cbd0', r: '#b85365' },
  },
  mason: {
    rows: ['...kk...', '..kPPk..', '.kPpppk.', '.kpkkpk.', '.kpeepk.', '..kppk..', '.kPyyPk.', 'kPpyyppk', 'kPpWpppk', '.kpPPpk.', 'kk.kk.kk'],
    pal: { k: '#201727', p: '#503354', P: '#94658e', e: '#f18caa', y: '#c49b63', W: '#ebd8a0' },
  },
  tank: {
    rows: [
      '.kkkkkkkkkkkkkk.',
      'ktTkggggggkTtTk',
      'kttkgGGGGgktttk',
      'kTTkgkkkkgkTTTk',
      'kttkkgGGgkktttk',
      'kTTkkGgggkkTTTk',
      'kttkkggdgkktttk',
      'kTTkgkkkkgkTTTk',
      'kttkggggggktttk',
      'kTtkdggggdkTtTk',
      '.kkkkkkkkkkkkkk.',
    ],
    pal: { k: '#1b2028', t: '#393d43', T: '#73777a', g: '#515b40', G: '#8c9765', d: '#b0744e' },
  },
  jet: {
    rows: [
      '......kk........',
      '.....kGk........',
      'kk..kGgk........',
      'krkkGggkkkkkk...',
      '.gGGGGGccGGGGgkk',
      'krkkgggkkkkkk...',
      'kk..kggk........',
      '.....kgk........',
      '......kk........',
    ],
    pal: { k: '#202334', g: '#535b75', G: '#a4aaba', r: '#e97c68', c: '#87d5dd' },
  },
  alien: {
    rows: ['.....kkkk.....', '....kaAAak....', '...kaeAAeak...', '..kkvvvvvvkk..', '.kvVVVVVVVVvk.', 'kvvlvvlvvlvvvk', '..kkvvvvvvkk..', '....k.k.k.k...'],
    pal: { k: '#17282d', a: '#4e9e83', A: '#a7d6ad', e: '#1d3740', v: '#525268', V: '#9594ac', l: '#b1e5b8' },
  },
  // Pointing right; the pivot is column 4, row 2 (see MISSILE_ORIGIN).
  missile: {
    rows: ['kk.......', 'kfmmmmMrr', 'kfMMMMMrr', 'kk.......'],
    pal: { k: '#252638', f: '#edb979', m: '#737889', M: '#bcc1cc', r: '#d95665' },
  },
};
export const MISSILE_ORIGIN = { x: 4 / 9, y: 2 / 4 };

/** Distinct 16×16 silhouettes; all retain the same boss anchor and scale. */
export const BOSS_ROWS: string[][] = [
  // Aegis: swept hair, high collar, epaulettes and split military cloak.
  [
    '.....kkkkkk.....', '....khhhhhhk....', '....hHHhhhkk....',
    '....kseesSk.....', '.....ksSsk......', '...kkkSSkkk.....',
    '..kcCaCCaCck....', '.kcCCCaCCCCck...', '.kcCCCaaCCCck...',
    '.kcSCaaaaCSck...', '.kcSCccccCSck...', '.kcskllllksck...',
    '.kccklkkklcck...', '.kccklkklkcck...', '..kkklkklkkk....',
    '....kbbkkbbk....',
  ],
  // Volt: winged crown, asymmetric hair and a tapered storm mantle.
  [
    '..ak..aa..ka....', '...ahhHHhha.....', '...khHHHHhhk....',
    '...khseesShk....', '....hksSshhk....', '..kcckSSkCcck...',
    '.kcCCCaCCCCCCk..', 'kcCCkCaaCkCCCck.', 'kccksCaaCskccck.',
    '.kcksCCCCskcck..', '..k.kCaCCk.ck...', '....klCClk......',
    '...kcllllc.k....', '..kccklklcck....', '...kkblkbkk.....',
    '....kbbkbbk.....',
  ],
  // Titan: heavy neck, oversized shoulders, glowing cracks and bare fists.
  [
    '.....kkkkkk.....', '....khHHhhhk....', '....kseesSsk....',
    '....ksSSSssk....', '.....ksSSsk.....', '..kkkCSSCCkkk...',
    '.kCCCaCCCaCCCk..', 'kCCaCCaaCCCaCCk.', 'kCCaCCaaCCCaCCk.',
    'kSSkCCaaCCCkSSk.', 'kSSkkCCCCkkkSSk.', '.kk.kllllk..kk..',
    '....klkklk......', '...kllkkllk.....', '...kllkkllk.....',
    '..kbbbkkbbbk....',
  ],
  // Sentinel: antennae, enclosed visor, angular armor and thruster boots.
  [
    '....a......a....', '....kCkkkkCk....', '....kCHHHCk.....',
    '....kaaaaak.....', '....kCCCCCk.....', '.....kCCk.......',
    '..kkCCaaCCkk....', '.kCCHCaaCHCCk...', 'kCCkCCaaCCkCCk..',
    'kSCkCCaaCCkCSk..', 'kSSkkCCCCkkSSk..', '.kk.kllllk.kk...',
    '....klkklk......', '....klkklk......', '...kCbkkbCk.....',
    '...kaakkkaak....',
  ],
];

/** Material ramps: outline, hair, highlight, skin, light, eyes, cloak, armor, core, hands, legs, boots. */
export const BOSS_PALETTES: Record<string, string>[] = [
  { k: '#172b32', h: '#284b4b', H: '#648779', s: '#b68a72', S: '#e0b49a', e: '#b5e8dc', c: '#293c43', C: '#467d72', a: '#c9a269', l: '#294c4c', b: '#383039' },
  { k: '#281e40', h: '#b79b63', H: '#e3c991', s: '#bc9398', S: '#e6bfaf', e: '#e3e0ff', c: '#3c2d5a', C: '#81699c', a: '#c6c1ec', l: '#514167', b: '#342a49' },
  { k: '#351e2b', h: '#482737', H: '#79404c', s: '#a04f50', S: '#cd7867', e: '#f4c58b', c: '#63313e', C: '#a65352', a: '#e5a36f', l: '#66363f', b: '#402733' },
  { k: '#23283d', h: '#566178', H: '#c6cfdf', s: '#8494ac', S: '#ced4e1', e: '#a6e4e8', c: '#414b66', C: '#899bb7', a: '#8fd7de', l: '#546078', b: '#32394f' },
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
