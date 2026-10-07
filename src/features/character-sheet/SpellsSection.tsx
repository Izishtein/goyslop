import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATALOGUED_SCHOOLS, getSpell, SPELLS, listSpellsBySchool, type SpellDefinition } from '../../data/spells';
import { DIVINE } from '../../data/spells/types';
import { deityAllows, listDeities, magicSchoolsOf, mpAfterCast, schoolLevel, spellProblems } from '../../lib/spellcasting';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownSpell } from '../../types/character';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

/** The circles a list of spells actually covers, in order. */
function circlesIn(spells: SpellDefinition[]): number[] {
  return [...new Set(spells.map((spell) => spell.circle))].sort((a, b) => a - b);
}

export function SpellsSection({ character }: { character: Character }) {
  const { t, i18n } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const schools = magicSchoolsOf(character);
  const pickableSchools = schools.filter((school) => CATALOGUED_SCHOOLS.includes(school));
  const [school, setSchool] = useState('');
  const [spellId, setSpellId] = useState('');
  const [search, setSearch] = useState('');
  // What was cast this session, newest last — so a click is never a silent MP drop.
  const [casts, setCasts] = useState<{ id: string; spell: KnownSpell; before: number; after: number }[]>([]);

  const activeSchool = school || pickableSchools[0] || '';
  const known = new Set(character.spells.map((spell) => spell.name));
  // A Priest worships one god and may only learn that god's Specialized Divine spells
  // (Core I p. 175); with no god chosen yet, only the Basic ones are offered.
  const allOptions = (activeSchool ? listSpellsBySchool(activeSchool) : []).filter(
    (spell) => activeSchool !== DIVINE || deityAllows(spell.deity, character.deity),
  );
  const isPriest = schools.includes(DIVINE);
  // 257 spells in one list is a scroll, not a choice. Filtering by name narrows it without
  // hiding the circle grouping, so a filtered list still says what is out of reach.
  const query = search.trim().toLowerCase();
  const options = query ? allOptions.filter((spell) => spell.name.toLowerCase().includes(query)) : allOptions;
  const levelInSchool = activeSchool ? schoolLevel(character, activeSchool) : 0;

  function setDeity(deity: string) {
    update((c) => ({ ...c, deity }));
    setSpellId('');
  }

  /** Casting spends the MP printed on the row; a spell the character cannot cast, or cannot
   *  pay for, does nothing rather than driving MP below zero. */
  function cast(spell: KnownSpell) {
    const before = character.mp.current;
    const left = mpAfterCast(before, spell.mp);
    if (left === null) return;
    update((c) => ({ ...c, mp: { current: left } }));
    setCasts((list) => [...list, { id: crypto.randomUUID(), spell, before, after: left }]);
  }

  /** Undo the latest cast: hands its MP back. Only the last one, so the log stays honest. */
  function undoLastCast() {
    const last = casts[casts.length - 1];
    if (!last) return;
    update((c) => ({ ...c, mp: { current: c.mp.current + (last.before - last.after) } }));
    setCasts((list) => list.slice(0, -1));
  }

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

  // Unlike Mounts/Geomancer/Tactician/EssenceWeaving (which vanish for a character who
  // can't use them at all), Spells stays on the sheet even for a non-caster and says so —
  // that message is load-bearing (SpellsSection.test.tsx), not just a placeholder, so this
  // collapses instead of disappearing. See the print effect comment in
  // CharacterSheetView.tsx for how paper still gets it in full regardless.
  const defaultOpen = schools.length > 0 || character.spells.length > 0;

  return (
    <details className={styles.section} data-collapsible open={defaultOpen}>
      <summary className={styles.sectionHead}>
        <h3>{t('sheet.spells')}</h3>
        <p className={styles.sectionNote}>
          {schools.length > 0 ? schools.join(' · ') : t('sheet.noMagicSchools')}
          {schools.length > 0 && (
            <>
              {' · '}
              {t('sheet.mp')}: <strong className={styles.numeric}>{character.mp.current}</strong>
            </>
          )}
        </p>
      </summary>

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.spells.map((spell) => {
                const problems = spellProblems(character, spell);
                const lacksMp = spell.mp > character.mp.current;
                return (
                <tr key={spell.id} data-problem={problems.length > 0 || undefined}>
                  <td>
                    <PrintableField value={spell.name} onChange={(e) => updateSpell(spell.id, { name: e.target.value })} aria-label={t('sheet.spellName')} />
                    {problems.map((problem) => (
                      <p key={problem} className={`${styles.overspent} ${styles.ruleWarning}`} role="alert">
                        {t(`sheet.spellProblem.${problem}`)}
                      </p>
                    ))}
                  </td>
                  <td>
                    <PrintableField value={spell.school} onChange={(e) => updateSpell(spell.id, { school: e.target.value })} aria-label={t('sheet.spellSchool')} />
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
                    <PrintableField value={spell.notes ?? ''} onChange={(e) => updateSpell(spell.id, { notes: e.target.value })} aria-label={t('sheet.spellNotes')} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => cast(spell)}
                      disabled={problems.length > 0 || lacksMp}
                      title={lacksMp ? t('sheet.notEnoughMp') : undefined}
                      aria-label={`${spell.name} ${t('sheet.castSpell')}`}
                    >
                      {t('sheet.castSpell')}
                    </button>
                  </td>
                  <td>
                    <button type="button" onClick={() => removeSpell(spell.id)} aria-label={`${spell.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {casts.length > 0 && (
        <div className={styles.turnLog} role="status" aria-live="polite" data-testid="cast-log">
          <h4>{t('sheet.castLog')}</h4>
          <ul>
            {casts.map((entry) => {
              const catalog = SPELLS.find((spell) => spell.name === entry.spell.name && spell.school === entry.spell.school);
              const key = `reference.spellEffect.${catalog?.id}`;
              return (
                <li key={entry.id}>
                  <strong>{entry.spell.name}</strong> — {t('sheet.castSpent', { mp: entry.spell.mp, before: entry.before, after: entry.after })}
                  {i18n.exists(key) && (
                    <details>
                      <summary>{t('sheet.castEffect')}</summary>
                      <p>{t(key)}</p>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={undoLastCast}>
            {t('sheet.castUndo')}
          </button>
          <button type="button" onClick={() => setCasts([])}>
            {t('sheet.castClear')}
          </button>
        </div>
      )}

      {character.spells.length === 0 && <p className={styles.empty}>{t('sheet.noSpells')}</p>}

      {/* Selects are data elsewhere on the sheet, so this picker is marked as chrome for print. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        {isPriest && (
          <>
            <label htmlFor="priest-deity">{t('sheet.deity')}</label>
            <select id="priest-deity" value={character.deity} onChange={(e) => setDeity(e.target.value)}>
              <option value="">{t('sheet.deityNone')}</option>
              {listDeities().map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </>
        )}
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
            <label htmlFor="spell-search">{t('sheet.searchSpells')}</label>
            <input
              id="spell-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSpellId('');
              }}
              placeholder={t('sheet.searchSpellsHint')}
            />
            <label htmlFor="add-spell">{t('sheet.addSpell')}</label>
            <select id="add-spell" value={spellId} onChange={(e) => setSpellId(e.target.value)}>
              <option value="">{t('creation.selectPlaceholder')}</option>
              {/* Core I stops at circle 6, Core II and Fairy Magic reach 10, and the three
                  supplement schools run to 15 — so the groups come from the data. */}
              {circlesIn(options).map((circle) => {
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
            {query && options.length === 0 && <p className={styles.empty}>{t('sheet.searchNoMatch')}</p>}
          </>
        ) : (
          <p className={styles.empty}>{t('sheet.noCatalogForSchool')}</p>
        )}
        <button type="button" onClick={addBlank}>
          {t('sheet.addCustomSpell')}
        </button>
      </div>
    </details>
  );
}
