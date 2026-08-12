import { useTranslation } from 'react-i18next';
import { COMBAT_FEAT_CATEGORIES, type CombatFeat, type CombatFeatCategory, type Character } from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import styles from './CharacterSheetView.module.css';

function newFeat(): CombatFeat {
  return { id: crypto.randomUUID(), name: '', category: 'passive' };
}

export function CombatFeatsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  function updateFeat(id: string, patch: Partial<CombatFeat>) {
    update((c) => ({ ...c, combatFeats: c.combatFeats.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  }
  function addFeat() {
    update((c) => ({ ...c, combatFeats: [...c.combatFeats, newFeat()] }));
  }
  function removeFeat(id: string) {
    update((c) => ({ ...c, combatFeats: c.combatFeats.filter((f) => f.id !== id) }));
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3>{t('sheet.combatFeats')}</h3>
      </div>

      {character.combatFeats.length === 0 ? (
        <p className={styles.empty}>{t('sheet.noCombatFeats')}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.category')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.combatFeats.map((feat) => (
                <tr key={feat.id}>
                  <td>
                    <input value={feat.name} onChange={(e) => updateFeat(feat.id, { name: e.target.value })} aria-label={t('sheet.name')} />
                  </td>
                  <td>
                    <select
                      value={feat.category}
                      onChange={(e) => updateFeat(feat.id, { category: e.target.value as CombatFeatCategory })}
                      aria-label={t('sheet.category')}
                    >
                      {COMBAT_FEAT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {t(`sheet.combatFeatCategory.${category}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button type="button" onClick={() => removeFeat(feat.id)}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.rowActions}>
        <button type="button" onClick={addFeat}>
          {t('sheet.addCombatFeat')}
        </button>
      </div>
    </section>
  );
}
