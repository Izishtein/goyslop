import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getClass } from '../../data/classes';
import { CATALOGUED_SCHOOLS, getSpell, listSpellsBySchool } from '../../data/spells';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownSpell } from '../../types/character';
import styles from './CharacterSheetView.module.css';

/** The schools this character casts from, in class order — Wizard-type classes only. */
function magicSchoolsOf(character: Character): string[] {
  const schools = character.classes
    .map((classLevel) => getClass(classLevel.classId))
    .filter((classDef) => classDef?.type === 'wizard')
    .map((classDef) => classDef?.magicSchool)
    .filter((school): school is string => Boolean(school));
  return [...new Set(schools)];
}

/** Highest level among the classes that cast from this school — the circle they know up to. */
function schoolLevel(character: Character, school: string): number {
  return character.classes
    .filter((classLevel) => getClass(classLevel.classId)?.magicSchool === school)
    .reduce((max, classLevel) => Math.max(max, classLevel.level), 0);
}

export function SpellsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const schools = magicSchoolsOf(character);
  const pickableSchools = schools.filter((school) => CATALOGUED_SCHOOLS.includes(school));
  const [school, setSchool] = useState('');
  const [spellId, setSpellId] = useState('');

  const activeSchool = school || pickableSchools[0] || '';
  const known = new Set(character.spells.map((spell) => spell.name));
  const options = activeSchool ? listSpellsBySchool(activeSchool) : [];
  const levelInSchool = activeSchool ? schoolLevel(character, activeSchool) : 0;

  function addSpell(spell: KnownSpell) {
    update((c) => ({ ...c, spells: [...c.spells, spell] }));
  }

  function addFromCatalog() {
    const found = getSpell(spellId);
    if (!found) return;
    addSpell({ id: crypto.randomUUID(), name: found.name, school: found.school, circle: found.circle, mp: found.mp ?? 0 });
    setSpellId('');
  }

  function addBlank() {
    addSpell({ id: crypto.randomUUID(), name: '', school: activeSchool || schools[0] || '', circle: 1, mp: 0 });
  }

  function updateSpell(id: string, patch: Partial<KnownSpell>) {
    update((c) => ({ ...c, spells: c.spells.map((spell) => (spell.id === id ? { ...spell, ...patch } : spell)) }));
  }

  function removeSpell(id: string) {
    update((c) => ({ ...c, spells: c.spells.filter((spell) => spell.id !== id) }));
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3>{t('sheet.spells')}</h3>
        <p className={styles.sectionNote}>
          {schools.length > 0 ? schools.join(' · ') : t('sheet.noMagicSchools')}
        </p>
      </div>

      <div className={styles.subsection} data-print-empty={character.spells.length === 0 || undefined}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.spellName')}</th>
                <th>{t('sheet.spellSchool')}</th>
                <th>{t('sheet.spellCircle')}</th>
                <th>{t('sheet.spellMp')}</th>
                <th>{t('sheet.spellNotes')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.spells.map((spell) => (
                <tr key={spell.id}>
                  <td>
                    <input value={spell.name} onChange={(e) => updateSpell(spell.id, { name: e.target.value })} aria-label={t('sheet.spellName')} />
                  </td>
                  <td>
                    <input value={spell.school} onChange={(e) => updateSpell(spell.id, { school: e.target.value })} aria-label={t('sheet.spellSchool')} />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={spell.circle}
                      onChange={(e) => updateSpell(spell.id, { circle: Number(e.target.value) })}
                      aria-label={t('sheet.spellCircle')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={spell.mp}
                      onChange={(e) => updateSpell(spell.id, { mp: Number(e.target.value) })}
                      aria-label={t('sheet.spellMp')}
                    />
                  </td>
                  <td>
                    <input value={spell.notes ?? ''} onChange={(e) => updateSpell(spell.id, { notes: e.target.value })} aria-label={t('sheet.spellNotes')} />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeSpell(spell.id)} aria-label={`${spell.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {character.spells.length === 0 && <p className={styles.empty}>{t('sheet.noSpells')}</p>}

      {/* Selects are data elsewhere on the sheet, so this picker is marked as chrome for print. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        {pickableSchools.length > 0 ? (
          <>
            {pickableSchools.length > 1 && (
              <select
                value={activeSchool}
                onChange={(e) => {
                  setSchool(e.target.value);
                  setSpellId('');
                }}
                aria-label={t('sheet.spellSchool')}
              >
                {pickableSchools.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
            <label htmlFor="add-spell">{t('sheet.addSpell')}</label>
            <select id="add-spell" value={spellId} onChange={(e) => setSpellId(e.target.value)}>
              <option value="">{t('creation.selectPlaceholder')}</option>
              {/* Core I stops at circle 6; Core II and Fairy Magic go to 10. */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((circle) => {
                const inCircle = options.filter((spell) => spell.circle === circle);
                if (inCircle.length === 0) return null;
                return (
                  <optgroup
                    key={circle}
                    // Casting is limited to circles up to the class level; the rest stay
                    // visible but flagged, since a sheet may be filled in ahead of a level-up.
                    label={`${t('sheet.circle', { circle })}${circle > levelInSchool ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
                  >
                    {inCircle.map((spell) => (
                      <option key={spell.id} value={spell.id} disabled={known.has(spell.name)}>
                        {spell.name} — {spell.mp ?? '?'} MP{spell.deity ? ` (${spell.deity})` : ''}
                        {spell.magisphere ? ` (${spell.magisphere})` : ''}
                        {spell.fairyType ? ` (${spell.fairyType})` : ''}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <button type="button" onClick={addFromCatalog} disabled={!spellId}>
              {t('sheet.addSpellAction')}
            </button>
          </>
        ) : (
          <p className={styles.empty}>{t('sheet.noCatalogForSchool')}</p>
        )}
        <button type="button" onClick={addBlank}>
          {t('sheet.addCustomSpell')}
        </button>
      </div>
    </section>
  );
}
