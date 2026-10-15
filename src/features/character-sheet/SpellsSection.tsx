import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATALOGUED_SCHOOLS, getSpell, SPELLS, listSpellsBySchool, type SpellDefinition } from '../../data/spells';
import { getSpellPower } from '../../data/spell-power';
import { DIVINE } from '../../data/spells/types';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { witchsFireAreaFrom, witchsFireBoost, witchsFireCost, type WitchsFireMode } from '../../lib/racial-abilities';
import { deityAllows, listDeities, magicSchoolsOf, mpAfterCast, schoolLevel, spellProblems } from '../../lib/spellcasting';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownSpell } from '../../types/character';
import { PrintableField } from './PrintableField';
import { SpellEffectRoll } from './SpellEffectRoll';
import { SpellResistRoll } from './SpellResistRoll';
import styles from './CharacterSheetView.module.css';
import { CatalogIcon, GameIcon } from '../../components/icons';

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
  const [casts, setCasts] = useState<{ id: string; spell: KnownSpell; before: number; after: number; fromStone: number; /** [Witch's Fire] taken on this casting: the mode and the extra MP paid. */ fire?: { mode: WitchsFireMode; cost: number } }[]>([]);
  /** The mode chosen for [Witch's Fire] on each cast, before it is taken. */
  const [fireModes, setFireModes] = useState<Record<string, WitchsFireMode>>({});
  /** MP the next casting takes from the mako stone instead of the caster's own pool. */
  const [stoneUse, setStoneUse] = useState(0);
  const stone = character.makoStone;
  /** What the next spell of this cost draws from the stone: what was asked, no more than the stone holds or the spell costs. */
  const drawFor = (cost: number): number => Math.max(0, Math.min(stoneUse, stone, cost));

  const activeSchool = school || pickableSchools[0] || '';
  /** A Baba Yaga in the witch's shape may take [Witch's Fire] on a spell with a power roll. */
  const witchShape = character.raceId === 'baba-yaga' && character.racial?.witch === true;
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
    const fromStone = drawFor(spell.mp);
    const left = mpAfterCast(before, spell.mp - fromStone);
    if (left === null) return;
    update((c) => ({ ...c, mp: { current: left }, makoStone: c.makoStone - fromStone }));
    setCasts((list) => [...list, { id: crypto.randomUUID(), spell, before, after: left, fromStone }]);
  }

  /** [Witch's Fire]: pays the extra MP for a spell just cast, and marks the casting so its power rolls are boosted. */
  function takeWitchsFire(id: string, mode: WitchsFireMode, cost: number) {
    if (character.mp.current < cost) return;
    update((c) => ({ ...c, mp: { current: c.mp.current - cost } }));
    setCasts((list) => list.map((entry) => (entry.id === id ? { ...entry, fire: { mode, cost } } : entry)));
  }

  /** Undo the latest cast: hands its MP back. Only the last one, so the log stays honest. */
  function undoLastCast() {
    const last = casts[casts.length - 1];
    if (!last) return;
    update((c) => ({ ...c, mp: { current: c.mp.current + (last.before - last.after) + (last.fire?.cost ?? 0) }, makoStone: c.makoStone + last.fromStone }));
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
        <h3><GameIcon name="section.spells" />{t('sheet.spells')}</h3>
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

      {(schools.length > 0 || stone > 0) && (
        <div className={styles.inlineRow}>
          <label>
            {t('sheet.makoStone')}{' '}
            <input
              type="number"
              min={0}
              value={stone}
              onChange={(e) => {
                const points = Math.max(0, Math.floor(Number(e.target.value)) || 0);
                update((c) => ({ ...c, makoStone: points }));
                setStoneUse((use) => Math.min(use, points));
              }}
              style={{ width: '4.5em' }}
            />
          </label>
          {stone > 0 && (
            <label className={styles.controlRow}>
              {t('sheet.makoStoneUse')}{' '}
              <input
                type="number"
                min={0}
                max={stone}
                value={Math.min(stoneUse, stone)}
                onChange={(e) => setStoneUse(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
                style={{ width: '4.5em' }}
              />
            </label>
          )}
        </div>
      )}

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
                const lacksMp = spell.mp - drawFor(spell.mp) > character.mp.current;
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
                    <CatalogIcon kind="school" id={spell.school} />
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
              const power = catalog ? getSpellPower(catalog.id) : undefined;
              return (
                <li key={entry.id}>
                  <strong>{entry.spell.name}</strong> —{' '}
                  {entry.fromStone > 0
                    ? t('sheet.castSpentStone', { mp: entry.spell.mp, stone: entry.fromStone, before: entry.before, after: entry.after })
                    : t('sheet.castSpent', { mp: entry.spell.mp, before: entry.before, after: entry.after })}
                  {power && power.power > 0 ? (
                    <>
                      {' '}
                      <SpellEffectRoll character={character} school={entry.spell.school} spell={power} fire={entry.fire ? witchsFireBoost(entry.fire.mode) : 0} />
                      {witchShape && (
                        <span>
                          {' '}
                          {entry.fire ? (
                            <em>{t('sheet.witchsFireTaken', { mode: t(`sheet.witchsFireMode.${entry.fire.mode}`), cost: entry.fire.cost })}</em>
                          ) : (
                            <>
                              <select
                                aria-label={t('sheet.witchsFireModeLabel')}
                                value={fireModes[entry.id] ?? 'target'}
                                onChange={(event) => setFireModes((current) => ({ ...current, [entry.id]: event.target.value as WitchsFireMode }))}
                              >
                                <option value="target">{t('sheet.witchsFireMode.target')}</option>
                                {adventurerLevel(character.classes) >= witchsFireAreaFrom && <option value="area">{t('sheet.witchsFireMode.area')}</option>}
                              </select>{' '}
                              <button
                                type="button"
                                disabled={character.mp.current < witchsFireCost(entry.spell.circle, adventurerLevel(character.classes))}
                                onClick={() => takeWitchsFire(entry.id, fireModes[entry.id] ?? 'target', witchsFireCost(entry.spell.circle, adventurerLevel(character.classes)))}
                              >
                                {t('sheet.witchsFire', { cost: witchsFireCost(entry.spell.circle, adventurerLevel(character.classes)) })}
                              </button>
                            </>
                          )}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {' '}
                      <SpellResistRoll character={character} school={entry.spell.school} />
                    </>
                  )}
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
