import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { essenceWeavingSlots } from '../../lib/formulas/requirements';
import { getEssenceWeaving, listEssenceWeavingsByLevel } from '../../data/essence-weavings';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownEssenceWeaving } from '../../types/character';
import styles from './CharacterSheetView.module.css';

const ESSENCE_WEAVING_LEVELS = [1, 5, 10] as const;

function darkHunterLevel(character: Character): number {
  return character.classes.filter((entry) => entry.classId === 'dark-hunter').reduce((max, entry) => Math.max(max, entry.level), 0);
}

export function EssenceWeavingSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [pick, setPick] = useState('');

  const level = darkHunterLevel(character);
  const slots = essenceWeavingSlots(level);
  const known = new Set(character.essenceWeavings.map((w) => w.name));

  /* Essence Weavings have no use outside this class, so the section stays hidden for
     everyone else — a saved Weaving keeps it reachable after a class change. */
  const show = level > 0 || character.essenceWeavings.length > 0;
  if (!show) return null;

  function setWeavings(next: (weavings: KnownEssenceWeaving[]) => KnownEssenceWeaving[]) {
    update((c) => ({ ...c, essenceWeavings: next(c.essenceWeavings) }));
  }
  function removeWeaving(id: string) {
    setWeavings((weavings) => weavings.filter((w) => w.id !== id));
  }
  function addFromCatalog() {
    const found = getEssenceWeaving(pick);
    if (!found) return;
    setWeavings((weavings) => [...weavings, { id: crypto.randomUUID(), name: found.name, type: found.type }]);
    setPick('');
  }

  return (
    <section className={styles.section} aria-labelledby="section-essence-weavings">
      <div className={styles.sectionHead}>
        <h3 id="section-essence-weavings">{t('sheet.essenceWeavings')}</h3>
        <p className={styles.sectionNote}>
          {level > 0 ? t('sheet.darkHunterLevel', { level }) : t('sheet.noDarkHunterClass')}
        </p>
      </div>

      <div className={styles.subsection} data-print-empty={character.essenceWeavings.length === 0 || undefined}>
        <h4 className={styles.subHead}>
          {t('sheet.essenceWeavings')}{' '}
          <span className={`${styles.numeric} ${character.essenceWeavings.length > slots ? styles.overspent : ''}`}>
            ({character.essenceWeavings.length} / {slots})
          </span>
        </h4>

        {character.essenceWeavings.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.stuntType')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {character.essenceWeavings.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>{t(`sheet.stuntTypeName.${w.type}`)}</td>
                    <td>
                      <button type="button" onClick={() => removeWeaving(w.id)} aria-label={`${w.name} ${t('sheet.remove')}`}>
                        {t('sheet.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${styles.inlineRow} ${styles.controlRow}`}>
          <label htmlFor="add-essence-weaving">{t('sheet.addEssenceWeavingFromCatalog')}</label>
          <select id="add-essence-weaving" value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {ESSENCE_WEAVING_LEVELS.map((weavingLevel) => (
              <optgroup
                key={weavingLevel}
                label={`${t('sheet.levelRequired', { level: weavingLevel })}${weavingLevel > level ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
              >
                {listEssenceWeavingsByLevel(weavingLevel).map((entry) => (
                  <option
                    key={entry.id}
                    value={entry.id}
                    disabled={known.has(entry.name)}
                    title={entry.prerequisite ? `${t('sheet.stuntPrerequisite')}: ${entry.prerequisite}` : undefined}
                  >
                    {entry.name} — {t(`sheet.stuntTypeName.${entry.type}`)}, {t('sheet.essenceWeavingCost')} {entry.cost}
                    {entry.prerequisite ? ` (${t('sheet.stuntPrerequisite')}: ${entry.prerequisite})` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addFromCatalog} disabled={!pick}>
            {t('sheet.addFromCatalog')}
          </button>
        </div>
      </div>
    </section>
  );
}
