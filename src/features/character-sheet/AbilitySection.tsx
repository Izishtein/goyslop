import { useTranslation } from 'react-i18next';
import { ABILITY_IDS, abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import styles from './CharacterSheetView.module.css';

export function AbilitySection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  function setField(id: (typeof ABILITY_IDS)[number], field: 'correction' | 'growth' | 'itemBonus', value: number) {
    update((c) => ({
      ...c,
      abilities: { ...c.abilities, [id]: { ...c.abilities[id], [field]: value } },
    }));
  }

  return (
    <table className={styles.abilityTable}>
      <thead>
        <tr>
          <th>{t('creation.ability')}</th>
          <th>{t('creation.base')}</th>
          <th>{t('creation.correction')}</th>
          <th>{t('creation.growth')}</th>
          <th>{t('creation.itemBonus')}</th>
          <th>{t('creation.total')}</th>
          <th>{t('creation.modifier')}</th>
        </tr>
      </thead>
      <tbody>
        {ABILITY_IDS.map((id) => {
          const score = character.abilities[id];
          const total = abilityTotal(score);
          const modifier = abilityModifier(total) + sumModifiersForField(character.statusEffects, id);
          return (
            <tr key={id}>
              <td>{id}</td>
              <td>{score.base}</td>
              <td>
                <input
                  type="number"
                  value={score.correction}
                  onChange={(event) => setField(id, 'correction', Number(event.target.value))}
                  aria-label={`${id} ${t('creation.correction')}`}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={score.growth}
                  onChange={(event) => setField(id, 'growth', Number(event.target.value))}
                  aria-label={`${id} ${t('creation.growth')}`}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={score.itemBonus}
                  onChange={(event) => setField(id, 'itemBonus', Number(event.target.value))}
                  aria-label={`${id} ${t('creation.itemBonus')}`}
                />
              </td>
              <td>{total}</td>
              <td>{modifier >= 0 ? `+${modifier}` : modifier}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
