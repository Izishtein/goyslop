import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel, wizardLevelSum } from '../../lib/formulas/character-levels';
import { hpMax, mpMax } from '../../lib/formulas/hp-mp';
import { getClass } from '../../data/classes';
import { getRace } from '../../data/races';
import type { Character } from '../../types/character';
import { charactersAtom } from '../../state/characters';
import { downloadCharacter } from '../character-io/downloadCharacter';
import { downloadRoster } from '../character-io/downloadRoster';
import { ImportCharacterButton } from '../character-io/ImportCharacterButton';
import styles from './RosterView.module.css';

/**
 * The roster as a screen of its own rather than a strip above the sheet.
 *
 * It used to be a row of buttons per character sitting over every screen in the app — four
 * buttons each, wrapping onto more and more lines as the roster grew, and all of it in the
 * way of the sheet the player is actually reading. Picking a character is something you do
 * between sessions, so it earns a tab, not permanent real estate.
 */
export function RosterView({
  activeId,
  onOpen,
  onNew,
  onDuplicate,
  onDelete,
  onClose,
}: {
  activeId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  onDuplicate: (character: Character) => void;
  /* Removing a character also has to decide who the sheet shows next, which is App's rule
     to keep (a null active id is how the creation form opens), so the deed itself stays
     there and this screen only arms and fires it. */
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const characters = useAtomValue(charactersAtom);

  /* Deleting is irreversible (localStorage is the only copy), so it takes two clicks. The
     arming state lives here, with the card that gets deleted, and resets when the screen is
     left — an armed delete should not survive a trip to the sheet and back. */
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleDelete(id: string) {
    onDelete(id);
    setPendingDeleteId(null);
  }

  return (
    <section className={styles.wrap} aria-labelledby="roster-title">
      <div className={styles.head}>
        <div>
          <h2 id="roster-title">
            {t('app.roster')} <span className={styles.count}>({characters.length})</span>
          </h2>
          <p className={styles.note}>{t('app.rosterIntro')}</p>
        </div>
        <div className={styles.headActions}>
          {characters.length > 0 && (
            <button type="button" onClick={() => downloadRoster(characters)}>
              {t('io.exportRoster')}
            </button>
          )}
          <ImportCharacterButton />
          <button type="button" onClick={onClose}>
            {t('app.rosterClose')}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {characters.map((character) => (
          <RosterCard
            key={character.id}
            character={character}
            active={character.id === activeId}
            armed={pendingDeleteId === character.id}
            onOpen={onOpen}
            onDuplicate={onDuplicate}
            onArmDelete={setPendingDeleteId}
            onDelete={handleDelete}
          />
        ))}

        {/* The "+" tile sits in the grid with the characters, where the eye already is,
            rather than as one more button in the header. */}
        <button type="button" className={styles.newCard} onClick={onNew}>
          <span className={styles.newPlus} aria-hidden="true">
            +
          </span>
          {t('app.newCharacter')}
        </button>
      </div>
    </section>
  );
}

function RosterCard({
  character,
  active,
  armed,
  onOpen,
  onDuplicate,
  onArmDelete,
  onDelete,
}: {
  character: Character;
  active: boolean;
  armed: boolean;
  onOpen: (id: string) => void;
  onDuplicate: (character: Character) => void;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();

  const race = getRace(character.raceId);
  const classLevel = character.classes[0];
  const classDef = classLevel ? getClass(classLevel.classId) : undefined;
  const advLevel = adventurerLevel(character.classes);
  const hp = hpMax(advLevel, abilityTotal(character.abilities.VIT));
  const mp = mpMax(wizardLevelSum(character.classes), abilityTotal(character.abilities.SPR));

  return (
    <article className={`${styles.card} ${active ? styles.cardActive : ''}`}>
      <div className={styles.cardTop}>
        {character.profile.avatar ? (
          <img className={styles.avatar} src={character.profile.avatar} alt="" />
        ) : (
          <div className={styles.avatarEmpty} aria-hidden="true" />
        )}

        <div className={styles.cardMain}>
          {/* The name is the button: opening a character is the card's whole purpose, and a
              separate "Open" next to it would only be a second way to say so. */}
          <button type="button" className={styles.name} onClick={() => onOpen(character.id)}>
            {character.name}
          </button>
          <p className={styles.meta}>
            {race?.name ?? character.raceId}
            {classDef || classLevel ? ` — ${classDef?.name ?? classLevel?.classId} ${classLevel?.level}` : ''}
          </p>
          <p className={styles.vitals}>
            <span>
              HP {Math.min(character.hp.current, hp)} / {hp}
            </span>
            <span>
              MP {Math.max(0, Math.min(character.mp.current, mp))} / {mp}
            </span>
          </p>
        </div>

        {active && <span className={styles.activeBadge}>{t('app.rosterActive')}</span>}
      </div>

      <div className={styles.cardActions}>
        <button type="button" onClick={() => downloadCharacter(character)} title={t('io.export')}>
          {t('io.exportShort')}
        </button>
        <button type="button" onClick={() => onDuplicate(character)} title={t('app.duplicate')}>
          {t('app.duplicateShort')}
        </button>
        {armed ? (
          <>
            <button type="button" className={styles.danger} onClick={() => onDelete(character.id)}>
              {t('app.confirmDelete', { name: character.name })}
            </button>
            <button type="button" onClick={() => onArmDelete(null)}>
              {t('app.cancel')}
            </button>
          </>
        ) : (
          <button type="button" className={styles.danger} onClick={() => onArmDelete(character.id)} title={t('app.delete')}>
            {t('app.deleteShort')}
          </button>
        )}
      </div>
    </article>
  );
}
