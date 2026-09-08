import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWorkSkill, listWorkSkillsByCategory, WORK_SKILL_CATEGORIES, WORK_SKILLS } from '../../data/work-skills';
import type { Character, KnownWorkSkill } from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

function newWorkSkill(): KnownWorkSkill {
  return { id: crypto.randomUUID(), name: '', category: '', level: 1, notes: '' };
}

/** Suggestion list shared by every row; a page only ever shows one sheet. */
const WORK_SKILLS_LIST_ID = 'work-skill-names';

export function WorkSkillsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [skillId, setSkillId] = useState('');

  const taken = new Set(character.workSkills.map((entry) => entry.name));
  const totalLevels = character.workSkills.reduce((sum, entry) => sum + entry.level, 0);
  // Epic Treasury p. 65: 5 levels per skill and 10 total is a creation-time guideline, not
  // a rule the book enforces past that point — flagged, not blocked, like Correction range.
  const overCap = totalLevels > 10 || character.workSkills.some((entry) => entry.level > 5);

  function updateSkill(id: string, patch: Partial<KnownWorkSkill>) {
    update((c) => ({ ...c, workSkills: c.workSkills.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) }));
  }
  function addSkill() {
    update((c) => ({ ...c, workSkills: [...c.workSkills, newWorkSkill()] }));
  }
  function addFromCatalog() {
    const found = getWorkSkill(skillId);
    if (!found) return;
    update((c) => ({
      ...c,
      workSkills: [...c.workSkills, { id: crypto.randomUUID(), name: found.name, category: found.category, level: 1, notes: '' }],
    }));
    setSkillId('');
  }
  function removeSkill(id: string) {
    update((c) => ({ ...c, workSkills: c.workSkills.filter((entry) => entry.id !== id) }));
  }

  return (
    <section className={styles.section} aria-labelledby="section-work-skills">
      <div className={styles.sectionHead}>
        <h3 id="section-work-skills">{t('sheet.workSkills')}</h3>
        <p className={styles.sectionNote}>
          {t('sheet.workSkillsLevels')}:{' '}
          <strong className={`${styles.numeric} ${overCap ? styles.overspent : ''}`}>{totalLevels} / 10</strong>
        </p>
      </div>
      <p className={styles.sectionNote}>{t('sheet.workSkillsIntro')}</p>

      {character.workSkills.length === 0 ? (
        <p className={styles.empty}>{t('sheet.noWorkSkills')}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.level')}</th>
                <th>{t('sheet.workSkillNotes')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.workSkills.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    {/* Raxia Life's 81 are a starting point, not a closed list — the book
                        itself invites GM-approved skills beyond it, so this suggests and
                        never binds, exactly like the combat feat name field. */}
                    <PrintableField
                      list={WORK_SKILLS_LIST_ID}
                      value={entry.name}
                      onChange={(e) => updateSkill(entry.id, { name: e.target.value })}
                      aria-label={t('sheet.name')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={entry.level}
                      onChange={(e) => updateSkill(entry.id, { level: Number(e.target.value) })}
                      aria-label={t('sheet.level')}
                    />
                  </td>
                  <td>
                    <PrintableField
                      value={entry.notes}
                      onChange={(e) => updateSkill(entry.id, { notes: e.target.value })}
                      aria-label={t('sheet.workSkillNotes')}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeSkill(entry.id)} aria-label={`${entry.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <datalist id={WORK_SKILLS_LIST_ID}>
        {WORK_SKILLS.map((entry) => (
          <option key={entry.id} value={entry.name} />
        ))}
      </datalist>

      {/* Selects are data elsewhere on the sheet, so this picker is marked as chrome for print. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        <label htmlFor="add-work-skill">{t('sheet.addWorkSkillFromCatalog')}</label>
        <select id="add-work-skill" value={skillId} onChange={(e) => setSkillId(e.target.value)}>
          <option value="">{t('creation.selectPlaceholder')}</option>
          {WORK_SKILL_CATEGORIES.map((category) => (
            <optgroup key={category} label={t(`sheet.workSkillCategory.${category}`)}>
              {listWorkSkillsByCategory(category).map((entry) => (
                <option key={entry.id} value={entry.id} disabled={taken.has(entry.name)}>
                  {entry.name} ({entry.profession})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button type="button" onClick={addFromCatalog} disabled={!skillId}>
          {t('sheet.addWorkSkillAction')}
        </button>
        <button type="button" onClick={addSkill}>
          {t('sheet.addCustomWorkSkill')}
        </button>
      </div>
    </section>
  );
}
