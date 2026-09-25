import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { stuntSlots } from '../../lib/formulas/requirements';
import {
  MOUNTS,
  MOUNT_CATEGORIES,
  MOUNT_VARIANTS,
  getMount,
  listMountGear,
  listMountsByCategory,
  mountLevelFor,
  rowsAtLevel,
  type MountDefinition,
} from '../../data/mounts';
import { getStunt, listStuntsByLevel, STUNTS } from '../../data/stunts';
import { useUpdateCharacter } from '../../state/characters';
import { MOUNT_CONTRACTS, STUNT_TYPES, type Character, type KnownMount, type MountSection, type Stunt } from '../../types/character';
import { PrintableField } from './PrintableField';
import { hasMounts, riderLevel } from './sections';
import styles from './CharacterSheetView.module.css';

const STUNT_LEVELS = [1, 5, 10] as const;

function newStunt(): Stunt {
  return { id: crypto.randomUUID(), name: '', type: 'passive' };
}

/** Suggestion list shared by every Stunt row; a page only ever shows one sheet. */
const STUNTS_LIST_ID = 'rider-stunt-names';

/** A Proprietary Contract adds +10 Max HP to every section (Core III p. 93), which is the
 *  one number on the sheet that depends on how the mount was acquired rather than on its
 *  level — so it is applied when the rows are built and re-applied when either changes. */
function sectionsFor(mount: MountDefinition, level: number, proprietary: boolean): MountSection[] {
  return rowsAtLevel(mount, level).map((row) => {
    const hpMax = row.hp + (proprietary ? 10 : 0);
    return {
      name: row.section ?? '',
      attack: row.attack,
      accuracy: row.accuracy,
      damage: row.damage,
      evasion: row.evasion,
      defense: row.defense,
      hpMax,
      hpCurrent: hpMax,
      mp: row.mp ?? 0,
      fortitude: row.fortitude ?? 0,
      willpower: row.willpower ?? 0,
      weapon: '',
      armor: '',
    };
  });
}

function rowFromCatalog(mount: MountDefinition, level: number): KnownMount {
  return {
    id: crypto.randomUUID(),
    mountId: mount.id,
    name: mount.name,
    category: mount.category,
    level,
    appropriateLevel: `${mount.appropriateLevel[0]}–${mount.appropriateLevel[1]}`,
    intelligence: mount.intelligence,
    perception: mount.perception,
    language: mount.language,
    weakPoint: mount.weakPoint,
    movement: mount.movement,
    contract: 'rental',
    carried: false,
    sections: sectionsFor(mount, level, false),
    uniqueSkills: mount.uniqueSkills.join(' · '),
    notes: '',
  };
}

function blankSection(): MountSection {
  return {
    name: '',
    attack: '',
    accuracy: 0,
    damage: '',
    evasion: 0,
    defense: 0,
    hpMax: 0,
    hpCurrent: 0,
    mp: 0,
    fortitude: 0,
    willpower: 0,
    weapon: '',
    armor: '',
  };
}

function blankMount(): KnownMount {
  return {
    id: crypto.randomUUID(),
    mountId: '',
    name: '',
    category: '',
    level: 1,
    appropriateLevel: '',
    intelligence: '',
    perception: '',
    language: '',
    weakPoint: '',
    movement: '',
    contract: 'rental',
    carried: false,
    sections: [blankSection()],
    uniqueSkills: '',
    notes: '',
  };
}

export function MountsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [pick, setPick] = useState('');
  const [stuntPick, setStuntPick] = useState('');

  const rider = riderLevel(character);
  const advLevel = adventurerLevel(character.classes);
  const slots = stuntSlots(rider);
  const known = new Set(character.stunts.map((s) => s.name));

  if (!hasMounts(character)) return null;

  function setMounts(next: (mounts: KnownMount[]) => KnownMount[]) {
    update((c) => ({ ...c, mounts: next(c.mounts) }));
  }

  function updateMount(id: string, patch: Partial<KnownMount>) {
    setMounts((mounts) => mounts.map((mount) => (mount.id === id ? { ...mount, ...patch } : mount)));
  }

  function updateSection(mountId: string, index: number, patch: Partial<MountSection>) {
    setMounts((mounts) =>
      mounts.map((mount) =>
        mount.id === mountId
          ? { ...mount, sections: mount.sections.map((section, i) => (i === index ? { ...section, ...patch } : section)) }
          : mount,
      ),
    );
  }

  /** Level and contract both change every number in the block, so both refill it from the
   *  catalog. A hand-typed mount has nothing to refill from and keeps what was entered. */
  function restat(mount: KnownMount, patch: { level?: number; contract?: KnownMount['contract'] }) {
    const definition = getMount(mount.mountId);
    const level = patch.level ?? mount.level;
    const contract = patch.contract ?? mount.contract;
    if (!definition) {
      updateMount(mount.id, { level, contract });
      return;
    }
    updateMount(mount.id, { level, contract, sections: sectionsFor(definition, level, contract === 'proprietary') });
  }

  function addFromCatalog() {
    const definition = getMount(pick);
    if (!definition) return;
    setMounts((mounts) => [...mounts, rowFromCatalog(definition, mountLevelFor(definition, advLevel))]);
    setPick('');
  }

  function addBlank() {
    setMounts((mounts) => [...mounts, blankMount()]);
  }

  function removeMount(id: string) {
    setMounts((mounts) => mounts.filter((mount) => mount.id !== id));
  }

  function setStunts(next: (stunts: Stunt[]) => Stunt[]) {
    update((c) => ({ ...c, stunts: next(c.stunts) }));
  }
  function updateStunt(id: string, patch: Partial<Stunt>) {
    setStunts((stunts) => stunts.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function addStuntFromCatalog() {
    const found = getStunt(stuntPick);
    if (!found) return;
    setStunts((stunts) => [...stunts, { id: crypto.randomUUID(), name: found.name, type: found.type }]);
    setStuntPick('');
  }
  function addCustomStunt() {
    setStunts((stunts) => [...stunts, newStunt()]);
  }
  function removeStunt(id: string) {
    setStunts((stunts) => stunts.filter((s) => s.id !== id));
  }

  const weapons = listMountGear('weapon');
  const armors = listMountGear('armor');

  return (
    <section className={styles.section} aria-labelledby="section-mounts">
      <div className={styles.sectionHead}>
        <h3 id="section-mounts">{t('sheet.mounts')}</h3>
        <p className={styles.sectionNote}>
          {rider > 0 ? t('sheet.riderLevel', { level: rider }) : t('sheet.noRiderClass')}
        </p>
      </div>

      {character.mounts.length === 0 && <p className={styles.empty}>{t('sheet.noMounts')}</p>}

      {character.mounts.map((mount) => {
        const definition = getMount(mount.mountId);
        const levels = definition
          ? Array.from(
              { length: definition.appropriateLevel[1] - definition.appropriateLevel[0] + 1 },
              (_, index) => definition.appropriateLevel[0] + index,
            )
          : [];
        return (
          <div key={mount.id} className={styles.subsection}>
            <div className={styles.inlineRow}>
              <PrintableField value={mount.name} onChange={(e) => updateMount(mount.id, { name: e.target.value })} aria-label={t('sheet.mountName')} />
              <label className={styles.field}>
                <span>{t('sheet.mountLevel')}</span>
                {definition ? (
                  <select value={mount.level} onChange={(e) => restat(mount, { level: Number(e.target.value) })} aria-label={t('sheet.mountLevel')}>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={mount.level}
                    onChange={(e) => updateMount(mount.id, { level: Number(e.target.value) })}
                    aria-label={t('sheet.mountLevel')}
                  />
                )}
              </label>
              <label className={styles.field}>
                <span>{t('sheet.mountContract')}</span>
                <select
                  value={mount.contract}
                  onChange={(e) => restat(mount, { contract: e.target.value as KnownMount['contract'] })}
                  aria-label={t('sheet.mountContract')}
                >
                  {MOUNT_CONTRACTS.map((kind) => (
                    <option key={kind} value={kind}>
                      {t(`sheet.mountContractKind.${kind}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>{t('sheet.mountCarried')}</span>
                {/* A select, not a checkbox: print strips a control down to its value on a
                    rule, and a checkbox leaves an empty box on paper (see ArtsSection). */}
                <select
                  value={mount.carried ? 'yes' : 'no'}
                  onChange={(e) => updateMount(mount.id, { carried: e.target.value === 'yes' })}
                  aria-label={t('sheet.mountCarried')}
                >
                  <option value="no">{t('sheet.no')}</option>
                  <option value="yes">{t('sheet.yes')}</option>
                </select>
              </label>
              <button type="button" onClick={() => removeMount(mount.id)} aria-label={`${mount.name} ${t('sheet.remove')}`}>
                {t('sheet.remove')}
              </button>
            </div>

            <p className={styles.sectionNote}>
              {[
                mount.appropriateLevel && `${t('sheet.mountAppropriateLevel')}: ${mount.appropriateLevel}`,
                mount.intelligence && `${t('sheet.mountIntelligence')}: ${mount.intelligence}`,
                mount.perception && `${t('sheet.mountPerception')}: ${mount.perception}`,
                mount.language && `${t('sheet.mountLanguage')}: ${mount.language}`,
                mount.weakPoint && `${t('sheet.mountWeakPoint')}: ${mount.weakPoint}`,
                mount.movement && `${t('sheet.mountMovement')}: ${mount.movement}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('sheet.mountSection')}</th>
                    <th>{t('sheet.mountAttack')}</th>
                    <th>{t('sheet.accuracyBonus')}</th>
                    <th>{t('sheet.mountDamage')}</th>
                    <th>{t('sheet.evasion')}</th>
                    <th>{t('sheet.defense')}</th>
                    <th>{t('sheet.hp')}</th>
                    <th>{t('sheet.mountHpMax')}</th>
                    <th>{t('sheet.mp')}</th>
                    {/* Short headers: at 8.5pt on paper "Fortitude" and "Willpower" ran into
                        each other in these narrow columns. The book abbreviates them too. */}
                    <th>{t('sheet.mountFortShort')}</th>
                    <th>{t('sheet.mountWillShort')}</th>
                    <th>{t('sheet.mountWeaponShort')}</th>
                    <th>{t('sheet.mountArmorShort')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mount.sections.map((section, index) => (
                    <tr key={`${mount.id}-${index}`}>
                      <td>
                        <PrintableField
                          value={section.name}
                          onChange={(e) => updateSection(mount.id, index, { name: e.target.value })}
                          aria-label={t('sheet.mountSection')}
                        />
                      </td>
                      <td>
                        <PrintableField
                          value={section.attack}
                          onChange={(e) => updateSection(mount.id, index, { attack: e.target.value })}
                          aria-label={t('sheet.mountAttack')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={section.accuracy}
                          onChange={(e) => updateSection(mount.id, index, { accuracy: Number(e.target.value) })}
                          aria-label={t('sheet.accuracyBonus')}
                        />
                      </td>
                      <td>
                        <PrintableField
                          value={section.damage}
                          onChange={(e) => updateSection(mount.id, index, { damage: e.target.value })}
                          aria-label={t('sheet.mountDamage')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={section.evasion}
                          onChange={(e) => updateSection(mount.id, index, { evasion: Number(e.target.value) })}
                          aria-label={t('sheet.evasion')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={section.defense}
                          onChange={(e) => updateSection(mount.id, index, { defense: Number(e.target.value) })}
                          aria-label={t('sheet.defense')}
                        />
                      </td>
                      {/* HP is two fields, not one: a section at 0 is disabled, and that is
                          the number the table watches during a fight. */}
                      {/* Current and max are two cells: a section at 0 HP is disabled, so the
                          current value is edited every fight while the max only moves with the
                          mount's level or its contract. */}
                      <td>
                        <input
                          type="number"
                          value={section.hpCurrent}
                          onChange={(e) => updateSection(mount.id, index, { hpCurrent: Number(e.target.value) })}
                          aria-label={t('sheet.hp')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={section.hpMax}
                          onChange={(e) => updateSection(mount.id, index, { hpMax: Number(e.target.value) })}
                          aria-label={t('sheet.mountHpMax')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={section.mp}
                          onChange={(e) => updateSection(mount.id, index, { mp: Number(e.target.value) })}
                          aria-label={t('sheet.mp')}
                        />
                      </td>
                      <td className={styles.numeric}>{section.fortitude === 0 ? '—' : section.fortitude}</td>
                      <td className={styles.numeric}>{section.willpower === 0 ? '—' : section.willpower}</td>
                      <td>
                        <PrintableField
                          list="mount-weapons"
                          value={section.weapon}
                          onChange={(e) => updateSection(mount.id, index, { weapon: e.target.value })}
                          aria-label={t('sheet.mountWeapon')}
                        />
                      </td>
                      <td>
                        <PrintableField
                          list="mount-armors"
                          value={section.armor}
                          onChange={(e) => updateSection(mount.id, index, { armor: e.target.value })}
                          aria-label={t('sheet.mountArmor')}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.inlineRow}>
              <label className={styles.field}>
                <span>{t('sheet.mountUniqueSkills')}</span>
                <PrintableField
                  value={mount.uniqueSkills}
                  onChange={(e) => updateMount(mount.id, { uniqueSkills: e.target.value })}
                  aria-label={t('sheet.mountUniqueSkills')}
                />
              </label>
              <label className={styles.field}>
                <span>{t('sheet.itemNote')}</span>
                <PrintableField value={mount.notes} onChange={(e) => updateMount(mount.id, { notes: e.target.value })} aria-label={t('sheet.itemNote')} />
              </label>
            </div>
          </div>
        );
      })}

      {/* Mount armaments are free text with suggestions, like the inventory rows: one weapon
          and one armor per section, and nothing stops a GM inventing another. */}
      <datalist id="mount-weapons">
        {weapons.map((entry) => (
          <option key={entry.id} value={entry.name} />
        ))}
      </datalist>
      <datalist id="mount-armors">
        {armors.map((entry) => (
          <option key={entry.id} value={entry.name} />
        ))}
      </datalist>

      <div className={`${styles.rowActions} ${styles.controlRow}`}>
        <label htmlFor="add-mount">{t('sheet.mountFromCatalog')}</label>
        <select id="add-mount" value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">{t('creation.selectPlaceholder')}</option>
          {MOUNT_CATEGORIES.map((category) => (
            <optgroup key={category} label={t(`sheet.mountCategory.${category}`)}>
              {listMountsByCategory(category).map((mount) => (
                <option
                  key={mount.id}
                  value={mount.id}
                  // Below the mount's minimum Appropriate Level a Jockey cannot handle it at
                  // all, so the option says so rather than silently offering a Lesser Dragon.
                  disabled={rider > 0 && rider < mount.appropriateLevel[0]}
                >
                  {mount.name} — {t('sheet.mountLevel')} {mount.appropriateLevel[0]}–{mount.appropriateLevel[1]},{' '}
                  {mount.purchasePrice.toLocaleString('ru-RU')} G
                  {mount.rentalPrice === undefined ? '' : ` / ${mount.rentalPrice.toLocaleString('ru-RU')} G`}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button type="button" onClick={addFromCatalog} disabled={!pick} aria-label={t('sheet.addMountFromCatalog')}>
          {t('sheet.addFromCatalog')}
        </button>
        <button type="button" onClick={addBlank}>
          {t('sheet.addMount')}
        </button>
      </div>

      <p className={styles.sectionNote}>
        {t('sheet.mountVariantsNote', { names: MOUNT_VARIANTS.map((entry) => entry.name).join(', ') })}
      </p>
      {/* Referencing the full catalog keeps the count honest if a book adds mounts later. */}
      <p className={styles.sectionNote}>{t('sheet.mountCatalogNote', { count: MOUNTS.length })}</p>

      <div className={styles.subsection} data-print-empty={character.stunts.length === 0 || undefined}>
        <h4 className={styles.subHead}>
          {t('sheet.stunts')}{' '}
          <span className={`${styles.numeric} ${character.stunts.length > slots ? styles.overspent : ''}`}>
            ({character.stunts.length} / {slots})
          </span>
        </h4>

        {character.stunts.length > 0 && (
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
                {character.stunts.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {/* Supplements past Core III may add Stunts the catalog does not cover
                          yet, so this suggests a name but never forces it. */}
                      <PrintableField list={STUNTS_LIST_ID} value={s.name} onChange={(e) => updateStunt(s.id, { name: e.target.value })} aria-label={t('sheet.name')} />
                    </td>
                    <td>
                      <select value={s.type} onChange={(e) => updateStunt(s.id, { type: e.target.value as Stunt['type'] })} aria-label={t('sheet.stuntType')}>
                        {STUNT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {t(`sheet.stuntTypeName.${type}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" onClick={() => removeStunt(s.id)} aria-label={`${s.name} ${t('sheet.remove')}`}>
                        {t('sheet.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <datalist id={STUNTS_LIST_ID}>
          {STUNTS.map((entry) => (
            <option key={entry.id} value={entry.name} />
          ))}
        </datalist>

        <div className={`${styles.inlineRow} ${styles.controlRow}`}>
          <label htmlFor="add-stunt">{t('sheet.addStuntFromCatalog')}</label>
          <select id="add-stunt" value={stuntPick} onChange={(e) => setStuntPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {STUNT_LEVELS.map((level) => (
              <optgroup
                key={level}
                label={`${t('sheet.levelRequired', { level })}${level > rider ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
              >
                {listStuntsByLevel(level).map((entry) => (
                  <option
                    key={entry.id}
                    value={entry.id}
                    disabled={known.has(entry.name)}
                    title={entry.prerequisite ? `${t('sheet.stuntPrerequisite')}: ${entry.prerequisite}` : undefined}
                  >
                    {entry.name}
                    {entry.prerequisite ? ` (${t('sheet.stuntPrerequisite')}: ${entry.prerequisite})` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addStuntFromCatalog} disabled={!stuntPick}>
            {t('sheet.addFromCatalog')}
          </button>
          <button type="button" onClick={addCustomStunt}>
            {t('sheet.addStunt')}
          </button>
        </div>
      </div>
    </section>
  );
}
