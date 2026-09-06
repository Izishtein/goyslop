import { useTranslation } from 'react-i18next';
import { ABILITY_IDS, abilityModifier, abilityTotal, type AbilityId } from '../../lib/formulas/abilities';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import styles from './CharacterSheetView.module.css';

const EDITABLE_PARTS = [
  { key: 'correction', label: 'creation.correctionShort' },
  { key: 'growth', label: 'creation.growthShort' },
  { key: 'itemBonus', label: 'creation.itemBonusShort' },
] as const;

export function AbilitySection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  function setField(id: AbilityId, field: 'correction' | 'growth' | 'itemBonus', value: number) {
    update((c) => ({
      ...c,
      abilities: { ...c.abilities, [id]: { ...c.abilities[id], [field]: value } },
    }));
  }

  /* A growth is +1 to an ability plus a line in the log saying when it was taken. The
     book's growth roll is not in the research docs, so the sheet records the result the
     player rolled instead of rolling for them. Removing a log line takes the +1 back, so
     the log and the Growth column can never drift apart. */
  function addGrowth(id: AbilityId) {
    update((c) => ({
      ...c,
      abilities: { ...c.abilities, [id]: { ...c.abilities[id], growth: c.abilities[id].growth + 1 } },
      growthLog: [
        ...c.growthLog,
        { id: crypto.randomUUID(), ability: id, adventurerLevel: adventurerLevel(c.classes) },
      ],
    }));
  }

  function removeGrowth(entryId: string) {
    update((c) => {
      const entry = c.growthLog.find((logged) => logged.id === entryId);
      if (!entry) return c;
      return {
        ...c,
        abilities: {
          ...c.abilities,
          [entry.ability]: { ...c.abilities[entry.ability], growth: c.abilities[entry.ability].growth - 1 },
        },
        growthLog: c.growthLog.filter((logged) => logged.id !== entryId),
      };
    });
  }

  function setGrowthNote(entryId: string, note: string) {
    update((c) => ({
      ...c,
      growthLog: c.growthLog.map((logged) => (logged.id === entryId ? { ...logged, note } : logged)),
    }));
  }

  return (
    <section className={styles.section} aria-labelledby="section-abilities">
      <div className={styles.sectionHead}>
        <h3 id="section-abilities">{t('sheet.abilities')}</h3>
      </div>

      <div className={styles.abilityGrid}>
        {ABILITY_IDS.map((id) => {
          const score = character.abilities[id];
          const total = abilityTotal(score);
          const modifier = abilityModifier(total) + sumModifiersForField(character.statusEffects, id);
          return (
            <article key={id} className={styles.abilityCard} aria-label={id}>
              <div className={styles.abilityTop}>
                <span className={styles.abilityName}>{id}</span>
                <span className={styles.abilityTotal} aria-label={`${id} ${t('creation.total')}`}>
                  {total}
                </span>
                <span className={styles.abilityMod} aria-label={`${id} ${t('creation.modifier')}`}>
                  {modifier >= 0 ? `+${modifier}` : modifier}
                </span>
              </div>

              <div className={styles.abilityParts}>
                <div className={styles.abilityPart}>
                  <span>{t('creation.baseShort')}</span>
                  <div className={styles.abilityPartStatic} aria-label={`${id} ${t('creation.base')}`}>
                    {score.base}
                  </div>
                </div>
                {EDITABLE_PARTS.map((part) => (
                  <label key={part.key} className={styles.abilityPart}>
                    <span>{t(part.label)}</span>
                    <input
                      type="number"
                      value={score[part.key]}
                      onChange={(event) => setField(id, part.key, Number(event.target.value))}
                      aria-label={`${id} ${t(`creation.${part.key}`)}`}
                    />
                  </label>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        <span className={styles.growthLabel}>{t('sheet.takeGrowth')}</span>
        {ABILITY_IDS.map((id) => (
          <button key={id} type="button" onClick={() => addGrowth(id)} aria-label={`${id} ${t('sheet.takeGrowth')}`}>
            {id} +1
          </button>
        ))}
      </div>

      <div className={styles.subsection} data-print-empty={character.growthLog.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.growthLog')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.growthAbility')}</th>
                <th>{t('sheet.adventurerLevel')}</th>
                <th>{t('sheet.spellNotes')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.growthLog.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.ability}</td>
                  <td className={styles.numeric}>{entry.adventurerLevel}</td>
                  <td>
                    <input
                      value={entry.note ?? ''}
                      onChange={(event) => setGrowthNote(entry.id, event.target.value)}
                      aria-label={t('sheet.spellNotes')}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeGrowth(entry.id)} aria-label={`${entry.ability} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
