import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getUniqueSkill,
  isUniqueSkillRace,
  uniqueSkillsOf,
  type UniqueSkillDefinition,
  type UniqueSkillRank,
} from '../../data/unique-skills';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import { DiceRoll } from './DiceRoll';
import { costParts, standardValueFor } from '../../lib/unique-skills';
import { heritorLevel } from './sections';
import styles from './CharacterSheetView.module.css';
import { GameIcon } from '../../components/icons';

/**
 * Unique skills of a Barbarous race (Barbarous Rage pp. 65-68): the player lists the ones the character has
 * learned and the rank of each; the sheet works out the Standard Value (a class level plus an ability modifier) and
 * rolls the Success Value, 2d6 + that. What a rank costs and does is in the Reference.
 */
export function UniqueSkillsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [pick, setPick] = useState('');

  const known = character.uniqueSkills ?? [];
  const race = isUniqueSkillRace(character.raceId) ? character.raceId : null;
  /* The skills have no use for anyone else, so the section is hidden — a saved skill keeps it reachable after the race changes. */
  if (!race && known.length === 0) return null;

  const knownIds = new Set(known.map((entry) => entry.id));
  const offered = race ? uniqueSkillsOf(race).filter((entry) => !knownIds.has(entry.id)) : [];
  const levels = { adventurer: adventurerLevel(character.classes), heritor: heritorLevel(character) };
  const modifiers = {
    INT: abilityModifier(abilityTotal(character.abilities.INT)),
    VIT: abilityModifier(abilityTotal(character.abilities.VIT)),
    SPR: abilityModifier(abilityTotal(character.abilities.SPR)),
  };

  function setSkills(next: (list: NonNullable<Character['uniqueSkills']>) => NonNullable<Character['uniqueSkills']>) {
    update((c) => ({ ...c, uniqueSkills: next(c.uniqueSkills ?? []) }));
  }
  function add() {
    const found = getUniqueSkill(pick);
    if (!found) return;
    setSkills((list) => [...list, { id: found.id, rank: found.ranks[0].rank }]);
    setPick('');
  }

  return (
    <section className={styles.section} aria-labelledby="section-unique-skills">
      <div className={styles.sectionHead}>
        <h3 id="section-unique-skills"><GameIcon name="section.uniqueSkills" />{t('reference.uniqueSkillUi.section')}</h3>
        <p className={styles.sectionNote}>{t('reference.uniqueSkillUi.sectionNote')}</p>
      </div>

      <div className={styles.subsection} data-print-empty={known.length === 0 || undefined}>
        {known.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('reference.uniqueSkillUi.rank')}</th>
                  <th>{t('reference.uniqueSkillUi.standard')}</th>
                  <th>{t('reference.uniqueSkillUi.resistance')}</th>
                  <th>{t('reference.uniqueSkillUi.costHeader')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {known.map((entry) => {
                  const definition = getUniqueSkill(entry.id);
                  if (!definition) return null;
                  return <KnownRow key={entry.id} definition={definition} rank={entry.rank} levels={levels} modifiers={modifiers} setRank={(rank) => setSkills((list) => list.map((item) => (item.id === entry.id ? { ...item, rank } : item)))} remove={() => setSkills((list) => list.filter((item) => item.id !== entry.id))} />;
                })}
              </tbody>
            </table>
          </div>
        )}
        {known.length === 0 && <p className={styles.sectionNote}>{t('reference.uniqueSkillUi.empty')}</p>}

        {offered.length > 0 && (
          <div className={`${styles.inlineRow} ${styles.controlRow}`}>
            <select value={pick} onChange={(event) => setPick(event.target.value)} aria-label={t('reference.uniqueSkillUi.add')}>
              <option value="">{t('reference.uniqueSkillUi.add')}…</option>
              {offered.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={add} disabled={!pick}>
              {t('reference.uniqueSkillUi.addButton')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function KnownRow({
  definition,
  rank,
  levels,
  modifiers,
  setRank,
  remove,
}: {
  definition: UniqueSkillDefinition;
  rank: UniqueSkillRank;
  levels: { adventurer: number; heritor: number };
  modifiers: { INT: number; VIT: number; SPR: number };
  setRank: (rank: UniqueSkillRank) => void;
  remove: () => void;
}) {
  const { t } = useTranslation();
  const entry = definition.ranks.find((item) => item.rank === rank) ?? definition.ranks[0];
  const value = standardValueFor(definition, levels, modifiers);
  return (
    <tr>
      <th scope="row" className={styles.rowName}>
        {definition.name}
        <div className={styles.sectionNote}>{t(`reference.uniqueSkill.${definition.id}.${entry.rank}`)}</div>
      </th>
      <td>
        {definition.ranks.length > 1 ? (
          <select value={entry.rank} onChange={(event) => setRank(event.target.value as UniqueSkillRank)} aria-label={`${definition.name} ${t('reference.uniqueSkillUi.rank')}`}>
            {definition.ranks.map((item) => (
              <option key={item.rank} value={item.rank}>
                {item.rank}
              </option>
            ))}
          </select>
        ) : (
          '—'
        )}
      </td>
      <td className={styles.numeric}>
        {value === null ? (
          '—'
        ) : (
          <>
            {value} <DiceRoll modifier={value} label={`${definition.name} ${t('reference.uniqueSkillUi.roll')}`} />
          </>
        )}
      </td>
      <td>
        {t(`reference.uniqueSkillUi.resist.${definition.resistance}`)}
        {definition.resistSave && ` (${definition.resistSave})`}
      </td>
      <td>{entry.cost ? t(`reference.uniqueSkillUi.cost.${costParts(entry.cost).key}`, costParts(entry.cost).values) : '—'}</td>
      <td>
        <button type="button" onClick={remove} aria-label={`${definition.name} ${t('sheet.remove')}`}>
          {t('sheet.remove')}
        </button>
      </td>
    </tr>
  );
}
