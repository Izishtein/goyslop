import { GAME_ICONS, type GameIconKey } from '../data/game-icons.generated';
import { ABYSSAL, ARCANE, DEEP_MAGIC, DIVINE, FAIRY, MAGITECH, NATURE, SPIRITUALISM, SUMMONING, TRUESPEECH } from '../data/spells/types';

/** Props to give a Lucide icon so it sits in a line of text like the game icons do. */
export const UI_ICON = { size: '1.1em', className: 'icon', 'aria-hidden': true } as const;

/** Folder of game-icons/icons -> the author's name as the project's licence file prints it, and where that is CC0. */
const AUTHORS: Record<string, { name: string; cc0?: boolean }> = {
  lorc: { name: 'Lorc' },
  delapouite: { name: 'Delapouite' },
  'caro-asercion': { name: 'Caro Asercion' },
  'carl-olsen': { name: 'Carl Olsen' },
  'john-colburn': { name: 'John Colburn' },
  darkzaitzev: { name: 'DarkZaitzev' },
  sbed: { name: 'Sbed' },
  'kier-heyl': { name: 'Kier Heyl' },
  skoll: { name: 'Skoll' },
  cathelineau: { name: 'Cathelineau' },
  zeromancer: { name: 'Zeromancer', cc0: true },
};

/** The authors of the game icons in use, derived from the spec so the credit cannot fall behind the icons. */
export function gameIconAuthors(): { name: string; cc0: boolean }[] {
  const folders = new Set(Object.values(GAME_ICONS).map((source) => source.split('/')[0]));
  return [...folders].sort().map((folder) => ({ name: AUTHORS[folder]?.name ?? folder, cc0: AUTHORS[folder]?.cc0 === true }));
}

export type CatalogKind = 'weapon' | 'school' | 'class' | 'race' | 'monster';

/** A magic school's name (as the catalogues spell it) -> the id its icon is filed under. */
const SCHOOL_ICON_ID: Record<string, string> = {
  [TRUESPEECH]: 'truespeech',
  [SPIRITUALISM]: 'spiritualism',
  [DIVINE]: 'divine',
  [MAGITECH]: 'magitech',
  [FAIRY]: 'fairy',
  [NATURE]: 'nature',
  [SUMMONING]: 'summoning',
  [ABYSSAL]: 'abyssal',
  [ARCANE]: 'arcane',
  [DEEP_MAGIC]: 'deep',
};

/**
 * The icon of a weapon category, magic school, class, race or monster category, or undefined when there is none
 * (a catalogue may grow faster than the icon spec). Schools are looked up by name, the rest by id.
 */
export function catalogIconKey(kind: CatalogKind, id: string): GameIconKey | undefined {
  const key = `${kind}.${kind === 'school' ? (SCHOOL_ICON_ID[id] ?? id) : id}`;
  return key in GAME_ICONS ? (key as GameIconKey) : undefined;
}
