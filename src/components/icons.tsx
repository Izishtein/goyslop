import { ICON_PATHS, GAME_ICONS, type GameIconKey } from '../data/game-icons.generated';
import { catalogIconKey, type CatalogKind } from './icon-info';

/*
 * Two icon sets, kept apart on purpose: Lucide (lucide-react, ISC) is the interface's — navigation, controls, state —
 * and game-icons.net (CC BY 3.0) is the game's — tabs of the sheet, kinds of equipment, schools of magic, sections of
 * the reference. Both are decoration: the words stay next to them, so they are hidden from assistive technology and
 * the accessible names of buttons and headings are the text they always were.
 */

/** An icon from game-icons.net, by the name the app gives it (scripts/game-icons.spec.json); it takes the colour of the text. */
export function GameIcon({ name, size = '1.15em' }: { name: GameIconKey; size?: string }) {
  return (
    <svg className="icon" viewBox="0 0 512 512" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[GAME_ICONS[name]]} />
    </svg>
  );
}

/** The icon of a catalogue entry (a weapon category, school, class, race or monster category); nothing when it has none. */
export function CatalogIcon({ kind, id }: { kind: CatalogKind; id: string }) {
  const name = catalogIconKey(kind, id);
  return name ? <GameIcon name={name} /> : null;
}
