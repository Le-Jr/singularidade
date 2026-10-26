import type { GameState } from '../types.ts';

export type UpgradeId =
  | 'time' | 'clone' | 'meteor' | 'phase'
  | 'bolts' | 'beam' | 'erase' | 'tp' | 'aura' | 'body' | 'regen';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  /** New power (shows the "Novo poder" tag on level 1). */
  power?: boolean;
  max: number;
  /** Card text for the next level; `level` is the current level (0 = not owned). */
  desc: (level: number) => string;
  apply: (s: GameState) => void;
}

/** To add an upgrade: add an entry here and read its `S.up` field where the effect happens. */
export const UPGRADES: UpgradeDef[] = [
  { id: 'time', name: 'Parar o Tempo', power: true, max: 3,
    desc: l => l ? 'O congelamento dura +1,5 s e recarrega 2 s mais rápido.' : 'Tecla Q: o mundo congela por 3 s. Só você se move e ataca.',
    apply: s => { s.up.time++; s.tsMax = 16 - 2 * (s.up.time - 1); } },
  { id: 'clone', name: 'Clones Quânticos', power: true, max: 4,
    desc: l => l ? 'Mais um clone dourado orbitando e atirando.' : 'Um clone seu orbita ao redor e atira sozinho no inimigo mais próximo.',
    apply: s => { s.up.clones++; } },
  { id: 'meteor', name: 'Chuva de Estrelas', power: true, max: 4,
    desc: l => l ? 'As estrelas caem com mais frequência.' : 'Estrelas caem do céu sobre seus inimigos, inclusive heróis.',
    apply: s => { s.up.meteor++; } },
  { id: 'phase', name: 'Escudo de Fase', power: true, max: 3,
    desc: l => l ? 'O escudo volta 2 s mais rápido.' : 'Você atravessa um projétil sem dano a cada 8 s.',
    apply: s => { s.up.phase++; } },
  { id: 'bolts', name: 'Rajada Múltipla', max: 4,
    desc: () => '+1 rajada de energia em cada disparo.',
    apply: s => { s.up.bolts++; } },
  { id: 'beam', name: 'Raio Ampliado', max: 4,
    desc: () => 'Raio Cósmico mais largo e com +40% de dano.',
    apply: s => { s.up.beamW += 0.5; s.up.beamDmg *= 1.4; } },
  { id: 'erase', name: 'Horizonte de Eventos', max: 4,
    desc: () => 'Apagar alcança 20% mais longe e recarrega 0,7 s mais rápido.',
    apply: s => { s.up.eraseR *= 1.2; s.up.eraseCd = Math.max(2, s.up.eraseCd - 0.7); } },
  { id: 'tp', name: 'Passo Quântico', max: 3,
    desc: () => 'Teleporte recarrega 25% mais rápido e explode maior.',
    apply: s => { s.up.tpCd *= 0.75; s.up.tpBlast += 12; } },
  { id: 'aura', name: 'Aura Nuclear', max: 4,
    desc: () => 'Aura maior e +50% de dano em quem encosta.',
    apply: s => { s.up.auraR += 6; s.up.auraDmg *= 1.5; } },
  { id: 'body', name: 'Corpo Eterno', max: 5,
    desc: () => '+250 de essência máxima e cura total.',
    apply: s => { s.P.max += 250; s.P.hp = s.P.max; } },
  { id: 'regen', name: 'Regeneração Cósmica', max: 4,
    desc: () => '+4 de essência por segundo.',
    apply: s => { s.up.regen += 4; } },
];
