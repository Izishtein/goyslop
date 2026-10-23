/*
 * Pictures of the races (src/assets/races/<id>.jpg): the illustrations printed with each race in the Outlaw Profile Book
 * (pp. 24-33) and in Barbarous Rage (pp. 76-94), cut out of the books by scripts/extract-pdf-images.mjs and shrunk by
 * scripts/shrink-images.mjs. A variety of a race shows the picture of the race it comes from.
 */
const PARENT: Record<string, string> = {
  'snow-elf': 'elf',
  'mist-elf': 'elf',
  'pico-tabbit': 'tabbit',
  'lupus-tabbit': 'tabbit',
  'guardian-runefolk': 'runefolk',
  'combat-runefolk': 'runefolk',
  'shadowborn-nightmare': 'nightmare',
  'soleilborn-nightmare': 'nightmare',
  'large-herbivore-lykant': 'lykant',
  'small-herbivore-lykant': 'lykant',
  'small-winged-lildraken': 'lildraken',
  'hairy-lildraken': 'lildraken',
  'alisha-grassrunner': 'grassrunner',
  'crimenos-grassrunner': 'grassrunner',
  'carnivorous-meria': 'meria',
  'fungi-meria': 'meria',
  'tech-tiens': 'tiens',
  'daemonic-tiens': 'tiens',
  'leprechaun-nomad': 'leprechaun',
  'leprechaun-explorer': 'leprechaun',
  'broken-drake': 'drake',
};

const FILES = import.meta.glob<string>('../assets/races/*.jpg', { eager: true, query: '?url', import: 'default' });

const URLS = new Map(Object.entries(FILES).map(([path, url]) => [/([^/]+)\.jpg$/.exec(path)![1], url]));

/** The race's own picture, else its parent race's; undefined when the books show neither. */
export function raceArtUrl(raceId: string): string | undefined {
  return URLS.get(raceId) ?? URLS.get(PARENT[raceId] ?? '');
}

/** Ids with a picture of their own, for the test that keeps the table honest. */
export const RACES_WITH_OWN_ART: readonly string[] = [...URLS.keys()];
export const RACE_ART_PARENTS: Readonly<Record<string, string>> = PARENT;
