import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSchool, getSchoolSecret, SCHOOLS, listSecretsBySchool } from '../../data/schools';
import { useUpdateCharacter } from '../../state/characters';
import { COMBAT_FEAT_CATEGORIES, type Character, type KnownSchool, type KnownSchoolSecret } from '../../types/character';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

export function SchoolsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [schoolPick, setSchoolPick] = useState('');
  const [secretPick, setSecretPick] = useState('');

  const joined = new Set(character.schools.map((s) => s.name));
  const joinedIds = new Set(character.schools.map((s) => s.id));
  const knownSecrets = new Set(character.schoolSecrets.map((s) => s.name));

  function setSchools(next: (schools: KnownSchool[]) => KnownSchool[]) {
    update((c) => ({ ...c, schools: next(c.schools) }));
  }
  function removeSchool(id: string) {
    setSchools((schools) => schools.filter((s) => s.id !== id));
  }
  function addSchoolFromCatalog() {
    const found = getSchool(schoolPick);
    if (!found) return;
    setSchools((schools) => [...schools, { id: crypto.randomUUID(), name: found.name }]);
    setSchoolPick('');
  }

  function setSecrets(next: (secrets: KnownSchoolSecret[]) => KnownSchoolSecret[]) {
    update((c) => ({ ...c, schoolSecrets: next(c.schoolSecrets) }));
  }
  function updateSecret(id: string, patch: Partial<KnownSchoolSecret>) {
    setSecrets((secrets) => secrets.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeSecret(id: string) {
    setSecrets((secrets) => secrets.filter((s) => s.id !== id));
  }
  function addSecretFromCatalog() {
    const found = getSchoolSecret(secretPick);
    if (!found) return;
    setSecrets((secrets) => [...secrets, { id: crypto.randomUUID(), name: found.name, schoolId: found.schoolId, type: found.type, notes: '' }]);
    setSecretPick('');
  }

  // No class gates this the way it gates Mounts/Geomancer/Tactician/EssenceWeaving —
  // School membership is bought with Reputation alone, open to anyone — so it can't just
  // vanish for a character not using it yet the way those do: there would be nothing left
  // on the sheet to click to start using it. Collapsed instead, not gone; see the print
  // effect comment in CharacterSheetView.tsx for how paper still gets it in full.
  const defaultOpen = character.schools.length > 0 || character.schoolSecrets.length > 0;

  return (
    <details className={styles.section} data-collapsible open={defaultOpen}>
      <summary className={styles.sectionHead}>
        <h3>{t('sheet.schools')}</h3>
        <p className={styles.sectionNote}>{t('sheet.schoolsNote')}</p>
      </summary>

      <div className={styles.subsection} data-print-empty={character.schools.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.schoolsJoined')}</h4>

        {character.schools.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {character.schools.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <button type="button" onClick={() => removeSchool(s.id)} aria-label={`${s.name} ${t('sheet.remove')}`}>
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
          <label htmlFor="add-school">{t('sheet.addSchoolFromCatalog')}</label>
          <select id="add-school" value={schoolPick} onChange={(e) => setSchoolPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {SCHOOLS.map((entry) => (
              <option key={entry.id} value={entry.id} disabled={joined.has(entry.name)}>
                {entry.name} ({t('sheet.schoolInitiationReputation')} {entry.initiationReputation}
                {entry.initiationNotes ? `, ${entry.initiationNotes}` : ''})
              </option>
            ))}
          </select>
          <button type="button" onClick={addSchoolFromCatalog} disabled={!schoolPick}>
            {t('sheet.addFromCatalog')}
          </button>
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={character.schoolSecrets.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.schoolSecrets')}</h4>

        {character.schoolSecrets.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.school')}</th>
                  <th>{t('sheet.secretType')}</th>
                  <th>{t('sheet.artNote')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {character.schoolSecrets.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{getSchool(s.schoolId)?.name ?? s.schoolId}</td>
                    <td>
                      <select value={s.type} onChange={(e) => updateSecret(s.id, { type: e.target.value as KnownSchoolSecret['type'] })} aria-label={t('sheet.secretType')}>
                        {COMBAT_FEAT_CATEGORIES.filter((c) => c !== 'auto').map((category) => (
                          <option key={category} value={category}>
                            {t(`sheet.combatFeatCategory.${category}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <PrintableField value={s.notes} onChange={(e) => updateSecret(s.id, { notes: e.target.value })} aria-label={t('sheet.artNote')} />
                    </td>
                    <td>
                      <button type="button" onClick={() => removeSecret(s.id)} aria-label={`${s.name} ${t('sheet.remove')}`}>
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
          <label htmlFor="add-secret">{t('sheet.addSecretFromCatalog')}</label>
          <select id="add-secret" value={secretPick} onChange={(e) => setSecretPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {SCHOOLS.map((sch) => (
              <optgroup key={sch.id} label={`${sch.name}${joinedIds.has(sch.id) ? '' : ` — ${t('sheet.schoolNotJoined')}`}`}>
                {listSecretsBySchool(sch.id).map((entry) => (
                  <option
                    key={entry.id}
                    value={entry.id}
                    disabled={knownSecrets.has(entry.name)}
                    title={entry.prerequisite && entry.prerequisite !== 'None' ? `${t('sheet.stuntPrerequisite')}: ${entry.prerequisite}` : undefined}
                  >
                    {entry.name} — {t(`sheet.combatFeatCategory.${entry.type}`)}, {t('sheet.schoolInitiationReputation')} {entry.requiredReputation}
                    {entry.prerequisite && entry.prerequisite !== 'None' ? ` (${t('sheet.stuntPrerequisite')}: ${entry.prerequisite})` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addSecretFromCatalog} disabled={!secretPick}>
            {t('sheet.addFromCatalog')}
          </button>
        </div>
      </div>
    </details>
  );
}
