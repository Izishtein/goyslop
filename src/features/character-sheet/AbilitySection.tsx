import { useTranslation } from 'react-i18next';
import { ABILITY_IDS, abilityModifier, abilityTotal, type AbilityId } from '../../lib/formulas/abilities';
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

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3>{t('sheet.abilities')}</h3>
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
    </section>
  );
}
