import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInfusion, INFUSION_RACES, INFUSION_TIERS, INFUSIONS, missingPrerequisites } from '../../data/infusions';
import { infusionSlots } from '../../lib/formulas/requirements';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownInfusion } from '../../types/character';
import { heritorLevel } from './sections';
import styles from './CharacterSheetView.module.css';

/**
 * Heritor Infusions (Barbarous Rage pp. 57-63): one per Heritor level, each of the 1st, 5th or 10th tier, some
 * needing another Infusion first. The sheet counts them and checks tier and prerequisites; the sections of a
 * transformed body and what an Infusion does to them stay with the player.
 */
export function InfusionSection({ character }: { character: Character }) {
  const { t, i18n } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [pick, setPick] = useState('');

  const level = heritorLevel(character);
  const slots = infusionSlots(level);
  const known = new Set(character.infusions.map((entry) => entry.name));

  /* The Infusions have no use outside this class, so the section is hidden for everyone else —
     a saved Infusion keeps it reachable after a class change. */
  if (level === 0 && character.infusions.length === 0) return null;

  function setInfusions(next: (list: KnownInfusion[]) => KnownInfusion[]) {
    update((c) => ({ ...c, infusions: next(c.infusions) }));
  }
  function addFromCatalog() {
    const found = getInfusion(pick);
    if (!found) return;
    setInfusions((list) => [...list, { id: crypto.randomUUID(), name: found.name }]);
    setPick('');
  }

  return (
    <section className={styles.section} aria-labelledby="section-infusions">
      <div className={styles.sectionHead}>
        <h3 id="section-infusions">{t('sheet.infusions')}</h3>
        <p className={styles.sectionNote}>{level > 0 ? t('sheet.heritorLevel', { level }) : t('sheet.noHeritorClass')}</p>
      </div>

      <div className={styles.subsection} data-print-empty={character.infusions.length === 0 || undefined}>
        <h4 className={styles.subHead}>
          {t('sheet.infusions')}{' '}
          <span className={`${styles.numeric} ${character.infusions.length > slots ? styles.overspent : ''}`}>
            ({character.infusions.length} / {slots})
          </span>
        </h4>
        <p className={styles.sectionNote}>{t('sheet.infusionsNote')}</p>

        {character.infusions.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.infusionSection')}</th>
                  <th>{t('sheet.infusionHumanForm')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {character.infusions.map((entry) => {
                  const definition = INFUSIONS.find((candidate) => candidate.name === entry.name);
                  const missing = definition ? missingPrerequisites(definition, known) : [];
                  const tooHigh = definition ? definition.requiredLevel > level : false;
                  const summaryKey = definition ? `reference.infusionSummary.${definition.id}` : '';
                  return (
                    <tr key={entry.id}>
                      <td>
                        {entry.name}
                        {summaryKey && i18n.exists(summaryKey) && <div className={styles.sectionNote}>{t(summaryKey)}</div>}
                        {missing.length > 0 && (
                          <div className={styles.overspent}>{t('sheet.infusionMissing', { list: missing.map((item) => item.name).join(', ') })}</div>
                        )}
                        {tooHigh && definition && <div className={styles.overspent}>{t('sheet.infusionTooHigh', { level: definition.requiredLevel })}</div>}
                      </td>
                      <td>{definition ? t(`sheet.infusionSections.${definition.section}`) : '—'}</td>
                      <td>{definition?.humanForm == null ? '—' : t(definition.humanForm ? 'sheet.infusionHuman.yes' : 'sheet.infusionHuman.no')}</td>
                      <td>
                        <button type="button" onClick={() => setInfusions((list) => list.filter((item) => item.id !== entry.id))} aria-label={`${entry.name} ${t('sheet.remove')}`}>
                          {t('sheet.remove')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${styles.inlineRow} ${styles.controlRow}`}>
          <label htmlFor="add-infusion">{t('sheet.addInfusionFromCatalog')}</label>
          <select id="add-infusion" value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {INFUSION_RACES.map((race) => (
              <optgroup key={race} label={t(`sheet.infusionRace.${race}`)}>
                {INFUSION_TIERS.flatMap((tier) =>
                  INFUSIONS.filter((entry) => entry.race === race && entry.requiredLevel === tier).map((entry) => {
                    const missing = missingPrerequisites(entry, known);
                    return (
                      <option key={entry.id} value={entry.id} disabled={known.has(entry.name)}>
                        {entry.name} — {t('sheet.levelRequired', { level: entry.requiredLevel })}
                        {entry.requiredLevel > level ? ` (${t('sheet.aboveClassLevel')})` : ''}
                        {missing.length > 0 ? ` — ${t('sheet.infusionMissing', { list: missing.map((item) => item.name).join(', ') })}` : ''}
                      </option>
                    );
                  }),
                )}
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
