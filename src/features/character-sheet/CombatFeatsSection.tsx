import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COMBAT_FEATS, getCombatFeat } from '../../data/combat-feats';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { combatFeatSlots, combatFeatsSpendingSlots } from '../../lib/formulas/requirements';
import { COMBAT_FEAT_CATEGORIES, type CombatFeat, type CombatFeatCategory, type Character } from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

function newFeat(): CombatFeat {
  return { id: crypto.randomUUID(), name: '', category: 'passive' };
}

/** Suggestion list shared by every feat row; a page only ever shows one sheet. */
const FEATS_LIST_ID = 'combat-feat-names';

export function CombatFeatsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [featId, setFeatId] = useState('');

  const taken = new Set(character.combatFeats.map((feat) => feat.name));

  // Auto-acquired feats come with a class level and cost nothing, so the count is of the
  // ones actually chosen. Over the limit is a bookkeeping error worth seeing, not a block:
  // a sheet is often filled in a level ahead of the session that grants the slot.
  const slots = combatFeatSlots(adventurerLevel(character.classes));
  const chosen = combatFeatsSpendingSlots(character.combatFeats);

  function updateFeat(id: string, patch: Partial<CombatFeat>) {
    update((c) => ({ ...c, combatFeats: c.combatFeats.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  }
  function addFeat() {
    update((c) => ({ ...c, combatFeats: [...c.combatFeats, newFeat()] }));
  }
  function addFromCatalog() {
    const found = getCombatFeat(featId);
    if (!found) return;
    update((c) => ({ ...c, combatFeats: [...c.combatFeats, { id: crypto.randomUUID(), name: found.name, category: found.category }] }));
    setFeatId('');
  }
  function removeFeat(id: string) {
    update((c) => ({ ...c, combatFeats: c.combatFeats.filter((f) => f.id !== id) }));
  }

  return (
    <section className={styles.section} aria-labelledby="section-combat-feats">
      <div className={styles.sectionHead}>
        <h3 id="section-combat-feats">{t('sheet.combatFeats')}</h3>
        <p className={styles.sectionNote}>
          {t('sheet.featSlots')}:{' '}
          <strong className={`${styles.numeric} ${chosen > slots ? styles.overspent : ''}`}>
            {chosen} / {slots}
          </strong>
        </p>
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
                    {/* Core III adds feats the docs do not cover yet, and the book's own
                        "/**" names are finished by hand, so this suggests and never binds. */}
                    <PrintableField
                      list={FEATS_LIST_ID}
                      value={feat.name}
                      onChange={(e) => updateFeat(feat.id, { name: e.target.value })}
                      aria-label={t('sheet.name')}
                    />
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
                    <button type="button" onClick={() => removeFeat(feat.id)} aria-label={`${feat.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <datalist id={FEATS_LIST_ID}>
        {COMBAT_FEATS.map((feat) => (
          <option key={feat.id} value={feat.name} />
        ))}
      </datalist>

      {/* Selects are data elsewhere on the sheet, so this picker is marked as chrome for print. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        <label htmlFor="add-feat">{t('sheet.addFeatFromCatalog')}</label>
        <select id="add-feat" value={featId} onChange={(e) => setFeatId(e.target.value)}>
          <option value="">{t('creation.selectPlaceholder')}</option>
          {COMBAT_FEAT_CATEGORIES.map((category) => (
            <optgroup key={category} label={t(`sheet.combatFeatCategory.${category}`)}>
              {COMBAT_FEATS.filter((feat) => feat.category === category).map((feat) => (
                <option key={feat.id} value={feat.id} disabled={taken.has(feat.name)}>
                  {feat.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button type="button" onClick={addFromCatalog} disabled={!featId}>
          {t('sheet.addCombatFeat')}
        </button>
        <button type="button" onClick={addFeat}>
          {t('sheet.addCustomCombatFeat')}
        </button>
      </div>
    </section>
  );
}
