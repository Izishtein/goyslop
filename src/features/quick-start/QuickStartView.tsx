import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel, wizardLevelSum } from '../../lib/formulas/character-levels';
import { fortitude, willpower } from '../../lib/formulas/derived-stats';
import { hpMax, mpMax } from '../../lib/formulas/hp-mp';
import { getClass } from '../../data/classes';
import { getRace } from '../../data/races';
import { CharacterSchema, type Character } from '../../types/character';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import styles from './QuickStartView.module.css';

/* The pregenerated characters (docs/roadmap.md § 5.2) live as plain .sw25.json files in
   /pregens at the repo root — the same shape the app's own import button reads — rather
   than as TS data under src/. import.meta.glob pulls them into the bundle at build time
   without needing `resolveJsonModule` (the project does not set it; see
   src/data/pregens.test.ts, which reads them the same way). roster.sw25.json is the
   combined export of the same seven and is skipped here to avoid listing everyone twice. */
const PREGEN_FILES = import.meta.glob<Record<string, unknown>>('../../../pregens/*.sw25.json', { eager: true, import: 'default' });

function loadPregens(): Character[] {
  const characters: Character[] = [];
  for (const [path, raw] of Object.entries(PREGEN_FILES)) {
    if (path.endsWith('/roster.sw25.json')) continue;
    const result = CharacterSchema.safeParse(raw);
    if (result.success) characters.push(result.data);
  }
  return characters.sort((a, b) => a.name.localeCompare(b.name));
}

const PREGENS = loadPregens();

/** A fresh copy with a new id, so taking the same pregen twice (two players who both want
 *  a Fighter) never collides, and taking it again after editing the first copy is safe. */
function instantiate(pregen: Character): Character {
  return { ...pregen, id: crypto.randomUUID() };
}

function PregenCard({ character, onTake }: { character: Character; onTake: (character: Character) => void }) {
  const { t } = useTranslation();
  const race = getRace(character.raceId);
  const classLevel = character.classes[0];
  const classDef = classLevel ? getClass(classLevel.classId) : undefined;
  const advLevel = adventurerLevel(character.classes);
  const wizLevels = wizardLevelSum(character.classes);

  const vitMod = abilityModifier(abilityTotal(character.abilities.VIT));
  const sprMod = abilityModifier(abilityTotal(character.abilities.SPR));
  const hp = hpMax(advLevel, abilityTotal(character.abilities.VIT));
  const mp = mpMax(wizLevels, abilityTotal(character.abilities.SPR));

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <h3>{character.name}</h3>
        <span className={styles.classBadge}>
          {classDef?.name ?? classLevel?.classId} {classLevel?.level}
        </span>
      </div>
      <p className={styles.meta}>
        {race?.name ?? character.raceId} · {character.background} · {t('sheet.adventurerLevel')} {advLevel}
      </p>

      <div className={styles.vitals}>
        <span>HP {hp}</span>
        <span>MP {mp}</span>
        <span>
          {t('sheet.fortitude')} {fortitude(advLevel, vitMod)}
        </span>
        <span>
          {t('sheet.willpower')} {willpower(advLevel, sprMod)}
        </span>
      </div>

      {character.notes.story && <p className={styles.story}>{character.notes.story}</p>}

      <button type="button" onClick={() => onTake(character)}>
        {t('quickStart.take')}
      </button>
    </article>
  );
}

export function QuickStartView({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const setCharacters = useSetAtom(charactersAtom);
  const setActiveId = useSetAtom(activeCharacterIdAtom);

  function take(pregen: Character) {
    const character = instantiate(pregen);
    setCharacters((prev) => [...prev, character]);
    setActiveId(character.id);
    onClose();
  }

  return (
    <article className={styles.wrap} aria-labelledby="quick-start-title">
      <div className={styles.head}>
        <div>
          <h2 id="quick-start-title">{t('quickStart.title')}</h2>
          <p className={styles.note}>{t('quickStart.intro')}</p>
        </div>
        <button type="button" onClick={onClose}>
          {t('quickStart.close')}
        </button>
      </div>

      <div className={styles.grid}>
        {PREGENS.map((character) => (
          <PregenCard key={character.id} character={character} onTake={take} />
        ))}
      </div>
    </article>
  );
}
