import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ABYSS_CURSES, enhancementsFor, type AbyssTarget } from '../../data/abyss';
import { listArtsByKind, type ArtKind } from '../../data/arts';
import { COMBAT_FEATS } from '../../data/combat-feats';
import { CONSUMABLE_PRESETS } from '../../data/consumables';
import {
  ARMORS,
  GENERAL_ITEMS,
  GENERAL_ITEM_CATEGORIES,
  SHIELDS,
  WEAPONS,
  WEAPON_CATEGORIES,
  type WeaponDefinition,
} from '../../data/equipment';
import { formatCards, listEvocations } from '../../data/evocations';
import {
  MOUNTS,
  MOUNT_CATEGORIES,
  MOUNT_GEAR_KINDS,
  MOUNT_VARIANTS,
  getMount,
  listMountGear,
  listMountsByCategory,
} from '../../data/mounts';
import { CATALOGUED_SCHOOLS, listSpellsBySchool } from '../../data/spells';
import { COMBAT_FEAT_CATEGORIES } from '../../types/character';
import styles from './ReferenceView.module.css';

export function SpellsReference() {
  const { t } = useTranslation();
  const [school, setSchool] = useState(CATALOGUED_SCHOOLS[0]);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const all = listSpellsBySchool(school);
  const spells = query ? all.filter((spell) => spell.name.toLowerCase().includes(query)) : all;

  return (
    <section className={styles.panel} aria-labelledby="reference-spells">
      <div className={styles.panelHead}>
        <h3 id="reference-spells">{t('reference.tab.spells')}</h3>
        <p className={styles.note}>{t('reference.spellsNote')}</p>
      </div>

      <div className={styles.controlRow}>
        <label htmlFor="reference-school">{t('sheet.spellSchool')}</label>
        <select id="reference-school" value={school} onChange={(event) => setSchool(event.target.value)}>
          {CATALOGUED_SCHOOLS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <label htmlFor="reference-spell-search">{t('sheet.searchSpells')}</label>
        <input id="reference-spell-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {spells.length === 0 ? (
        <p className={styles.missing}>{t('sheet.searchNoMatch')}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.spellName')}</th>
                <th>{t('sheet.spellCircle')}</th>
                <th>{t('sheet.spellMp')}</th>
                <th>{t('reference.book')}</th>
              </tr>
            </thead>
            <tbody>
              {spells.map((spell) => (
                <tr key={spell.id}>
                  <th scope="row" className={styles.rowName}>
                    {spell.name}
                    {spell.deity ? ` (${spell.deity})` : ''}
                    {spell.magisphere ? ` (${spell.magisphere})` : ''}
                    {spell.fairyType ? ` (${spell.fairyType})` : ''}
                  </th>
                  <td className={styles.numeric}>{spell.circle}</td>
                  <td className={styles.numeric}>{spell.mp ?? '?'}</td>
                  <td>{spell.sourceBook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function CombatFeatsReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-feats">
      <div className={styles.panelHead}>
        <h3 id="reference-feats">{t('reference.tab.feats')}</h3>
        <p className={styles.note}>{t('reference.featsNote')}</p>
      </div>

      {COMBAT_FEAT_CATEGORIES.map((category) => (
        <div key={category} className={styles.group}>
          <h4>{t(`sheet.combatFeatCategory.${category}`)}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('reference.book')}</th>
                </tr>
              </thead>
              <tbody>
                {COMBAT_FEATS.filter((feat) => feat.category === category).map((feat) => (
                  <tr key={feat.id}>
                    <th scope="row" className={styles.rowName}>
                      {feat.name}
                    </th>
                    <td>{feat.sourceBook}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

/** The order the book introduces them: the Enhancer's, then the Bard's two. */
const ART_KINDS: ArtKind[] = ['technique', 'spellsong', 'finale'];

export function EvocationsReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-evocations">
      <div className={styles.panelHead}>
        <h3 id="reference-evocations">{t('reference.tab.evocations')}</h3>
        <p className={styles.note}>{t('reference.evocationsNote')}</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('sheet.name')}</th>
              <th>{t('sheet.requiredLevel')}</th>
              <th>{t('sheet.materialCards')}</th>
              <th>{t('sheet.minorAction')}</th>
              <th>{t('sheet.preparation')}</th>
            </tr>
          </thead>
          <tbody>
            {listEvocations().map((entry) => (
              <tr key={entry.id}>
                <th scope="row" className={styles.rowName}>
                  {entry.name}
                </th>
                <td className={styles.numeric}>{entry.requiredLevel}</td>
                <td>{formatCards(entry.cards)}</td>
                <td>{entry.minorAction ? '▶▶' : '—'}</td>
                <td>{entry.preparation ? '△' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ArtsReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-arts">
      <div className={styles.panelHead}>
        <h3 id="reference-arts">{t('reference.tab.arts')}</h3>
        <p className={styles.note}>{t('reference.artsNote')}</p>
      </div>

      {ART_KINDS.map((kind) => (
        <div key={kind} className={styles.group}>
          <h4>{t(`sheet.${kind}s`)}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.requiredLevel')}</th>
                  {kind === 'technique' && <th>{t('sheet.preparation')}</th>}
                  {kind === 'technique' && <th>{t('sheet.duration')}</th>}
                  {kind !== 'technique' && <th>{kind === 'finale' ? t('sheet.rhythmCost') : t('sheet.rhythm')}</th>}
                  {kind === 'spellsong' && <th>{t('sheet.flourish')}</th>}
                  {kind === 'spellsong' && <th>{t('sheet.pets')}</th>}
                  {kind !== 'technique' && <th>{t('sheet.resistance')}</th>}
                  {kind !== 'technique' && <th>{t('sheet.damageType')}</th>}
                </tr>
              </thead>
              <tbody>
                {listArtsByKind(kind).map((art) => (
                  <tr key={art.id}>
                    <th scope="row" className={styles.rowName}>
                      {art.name}
                    </th>
                    <td className={styles.numeric}>{art.requiredLevel}</td>
                    {kind === 'technique' && <td>{art.preparation ? '△' : '—'}</td>}
                    {kind === 'technique' && <td>{art.duration ? t(`sheet.duration_${art.duration}`) : '—'}</td>}
                    {kind !== 'technique' && <td>{art.rhythm}</td>}
                    {kind === 'spellsong' && <td className={styles.numeric}>{art.flourish}</td>}
                    {kind === 'spellsong' && <td>{art.pets}</td>}
                    {kind !== 'technique' && <td>{art.resistance}</td>}
                    {kind !== 'technique' && <td>{art.damageType}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

const ABYSS_TARGETS: AbyssTarget[] = ['weapon', 'armor', 'shield'];

export function ItemsReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-items">
      <div className={styles.panelHead}>
        <h3 id="reference-items">{t('reference.tab.items')}</h3>
        <p className={styles.note}>{t('reference.itemsNote')}</p>
      </div>

      <div className={styles.group}>
        <h4>{t('sheet.abyssEnhancement')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.enhancementTarget')}</th>
                <th>{t('sheet.abyssType')}</th>
              </tr>
            </thead>
            <tbody>
              {ABYSS_TARGETS.map((target) => (
                <tr key={target}>
                  <th scope="row" className={styles.rowName}>
                    {t(`reference.target_${target}`)}
                  </th>
                  <td>{enhancementsFor(target).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('sheet.abyssCurse')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.roll2d')}</th>
                <th>{t('sheet.name')}</th>
              </tr>
            </thead>
            <tbody>
              {ABYSS_CURSES.map((curse) => (
                <tr key={curse.roll}>
                  <th scope="row" className={styles.numeric}>
                    {curse.roll}
                  </th>
                  <td>{curse.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.consumables')}</h4>
        <p>{CONSUMABLE_PRESETS.join(' · ')}</p>
      </div>
    </section>
  );
}

/** The one line the sheet needs from a weapon's grip: everything the book prints in that
 *  row, joined the way the tables print it. */
function stanceSummary(definition: WeaponDefinition): string {
  return definition.rows
    .map((row) => {
      const power = row.power === undefined ? '—' : String(row.power);
      const sign = (value: number) => (value > 0 ? `+${value}` : value === 0 ? '—' : String(value));
      return `${row.stance} ${row.minStr} / ${sign(row.accuracy)} / ${power} / ${row.criticalValue} / ${sign(row.extraDamage)}`;
    })
    .join(' · ');
}

export function EquipmentReference() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<(typeof WEAPON_CATEGORIES)[number] | 'all'>('all');

  const weapons = category === 'all' ? WEAPONS : WEAPONS.filter((entry) => entry.category === category);

  return (
    <section className={styles.panel} aria-labelledby="reference-equipment">
      <div className={styles.panelHead}>
        <h3 id="reference-equipment">{t('reference.tab.equipment')}</h3>
        <p className={styles.note}>{t('reference.equipmentNote')}</p>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.weapons')}</h4>
        <div className={styles.controlRow}>
          <label htmlFor="reference-weapon-category">{t('sheet.weapons')}</label>
          <select
            id="reference-weapon-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as typeof category)}
          >
            <option value="all">{t('reference.allCategories')}</option>
            {WEAPON_CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {t(`sheet.weaponCategory.${name}`)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.rank')}</th>
                {/* One column for the whole row of numbers: a weapon with two grips has two
                    sets of them, and five more columns would not fit either screen or paper. */}
                <th>{t('reference.weaponLine')}</th>
                <th>{t('sheet.range')}</th>
                <th>{t('reference.price')}</th>
                <th>{t('sheet.itemNote')}</th>
              </tr>
            </thead>
            <tbody>
              {weapons.map((entry) => (
                <tr key={entry.id}>
                  <th scope="row" className={styles.rowName}>
                    {entry.name}
                  </th>
                  <td>{entry.rank}</td>
                  <td>{stanceSummary(entry)}</td>
                  <td>{entry.range ?? '—'}</td>
                  <td className={styles.numeric}>{entry.price === undefined ? '—' : entry.price.toLocaleString('ru-RU')}</td>
                  <td>{entry.notes ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.armors')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.rank')}</th>
                <th>{t('sheet.minStr')}</th>
                <th>{t('sheet.evasionModifier')}</th>
                <th>{t('sheet.defense')}</th>
                <th>{t('reference.price')}</th>
                <th>{t('sheet.itemNote')}</th>
              </tr>
            </thead>
            <tbody>
              {ARMORS.map((entry) => (
                <tr key={entry.id}>
                  <th scope="row" className={styles.rowName}>
                    {entry.name}
                  </th>
                  <td>{entry.rank}</td>
                  <td className={styles.numeric}>{entry.minStr}</td>
                  <td className={styles.numeric}>{entry.evasion === 0 ? '—' : `+${entry.evasion}`}</td>
                  <td className={styles.numeric}>{entry.defense}</td>
                  <td className={styles.numeric}>{entry.price.toLocaleString('ru-RU')}</td>
                  <td>{entry.notes ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.shields')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.rank')}</th>
                <th>{t('sheet.minStr')}</th>
                <th>{t('sheet.evasionModifier')}</th>
                <th>{t('sheet.defense')}</th>
                <th>{t('reference.price')}</th>
                <th>{t('sheet.itemNote')}</th>
              </tr>
            </thead>
            <tbody>
              {SHIELDS.map((entry) => (
                <tr key={entry.id}>
                  <th scope="row" className={styles.rowName}>
                    {entry.name}
                  </th>
                  <td>{entry.rank}</td>
                  <td className={styles.numeric}>{entry.minStr}</td>
                  <td className={styles.numeric}>{entry.evasion === 0 ? '—' : `+${entry.evasion}`}</td>
                  <td className={styles.numeric}>{entry.defense}</td>
                  <td className={styles.numeric}>{entry.price.toLocaleString('ru-RU')}</td>
                  <td>{[entry.mountProtection ? t('sheet.mountProtection') : '', entry.notes ?? ''].filter(Boolean).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.generalItems')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('reference.itemGroup')}</th>
                <th>{t('reference.price')}</th>
                <th>{t('sheet.itemNote')}</th>
              </tr>
            </thead>
            <tbody>
              {GENERAL_ITEM_CATEGORIES.flatMap((group) =>
                GENERAL_ITEMS.filter((entry) => entry.category === group).map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.rowName}>
                      {entry.name}
                    </th>
                    <td>
                      {t(`reference.itemCategory.${group}`)}
                      {entry.slot ? ` — ${entry.slot}` : ''}
                    </td>
                    <td>{entry.price}</td>
                    <td>{entry.notes ?? ''}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function MountsReference() {
  const { t } = useTranslation();
  const [mountId, setMountId] = useState(MOUNTS[0].id);

  const mount = getMount(mountId) ?? MOUNTS[0];

  return (
    <section className={styles.panel} aria-labelledby="reference-mounts">
      <div className={styles.panelHead}>
        <h3 id="reference-mounts">{t('reference.tab.mounts')}</h3>
        <p className={styles.note}>{t('reference.mountsNote')}</p>
      </div>

      <div className={styles.controlRow}>
        <label htmlFor="reference-mount">{t('sheet.mountName')}</label>
        <select id="reference-mount" value={mountId} onChange={(event) => setMountId(event.target.value)}>
          {MOUNT_CATEGORIES.map((category) => (
            <optgroup key={category} label={t(`sheet.mountCategory.${category}`)}>
              {listMountsByCategory(category).map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <h4>{mount.name}</h4>
        <p className={styles.note}>
          {t('sheet.mountAppropriateLevel')}: {mount.appropriateLevel[0]}–{mount.appropriateLevel[1]} ·{' '}
          {t('sheet.mountIntelligence')}: {mount.intelligence} · {t('sheet.mountPerception')}: {mount.perception} ·{' '}
          {t('sheet.mountLanguage')}: {mount.language} · {t('sheet.mountWeakPoint')}: {mount.weakPoint} ·{' '}
          {t('sheet.mountMovement')}: {mount.movement}
        </p>
        <p className={styles.note}>
          {t('reference.price')}: {mount.purchasePrice.toLocaleString('ru-RU')} G
          {mount.rentalPrice === undefined ? '' : ` / ${mount.rentalPrice.toLocaleString('ru-RU')} G`}
          {mount.regenerationPrice === undefined ? '' : ` / ${mount.regenerationPrice.toLocaleString('ru-RU')} G`}
          {mount.sections ? ` · ${t('sheet.mountSection')}: ${mount.sections.count} (${mount.sections.names.join(' / ')}), ${mount.sections.main}` : ''}
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.mountLevel')}</th>
                <th>{t('sheet.mountSection')}</th>
                <th>{t('sheet.mountAttack')}</th>
                <th>{t('sheet.accuracyBonus')}</th>
                <th>{t('sheet.mountDamage')}</th>
                <th>{t('sheet.evasion')}</th>
                <th>{t('sheet.defense')}</th>
                <th>{t('sheet.hp')}</th>
                <th>{t('sheet.mp')}</th>
                <th>{t('sheet.fortitude')}</th>
                <th>{t('sheet.willpower')}</th>
              </tr>
            </thead>
            <tbody>
              {mount.levels.map((row, index) => (
                <tr key={`${row.level}-${row.section ?? index}`}>
                  <th scope="row" className={styles.numeric}>
                    {row.level}
                  </th>
                  <td>{row.section ?? '—'}</td>
                  <td>{row.attack}</td>
                  <td className={styles.numeric}>{row.accuracy}</td>
                  <td>{row.damage}</td>
                  <td className={styles.numeric}>{row.evasion}</td>
                  <td className={styles.numeric}>{row.defense}</td>
                  <td className={styles.numeric}>{row.hp}</td>
                  <td className={styles.numeric}>{row.mp ?? '—'}</td>
                  <td className={styles.numeric}>{row.fortitude ?? '—'}</td>
                  <td className={styles.numeric}>{row.willpower ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          {t('sheet.mountUniqueSkills')}: {mount.uniqueSkills.length > 0 ? mount.uniqueSkills.join(' · ') : '—'}
        </p>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.mountVariants')}</h4>
        <p>
          {MOUNT_VARIANTS.map(
            (entry) => `${entry.name} (${getMount(entry.variantOf)?.name ?? entry.variantOf}, ${entry.purchasePrice.toLocaleString('ru-RU')} G + ${entry.reputationPrice})`,
          ).join(' · ')}
        </p>
      </div>

      {MOUNT_GEAR_KINDS.map((kind) => (
        <div key={kind} className={styles.group}>
          <h4>{t(`reference.mountGear.${kind}`)}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('reference.mountGearFor')}</th>
                  <th>{t('reference.price')}</th>
                  <th>{t('sheet.itemNote')}</th>
                </tr>
              </thead>
              <tbody>
                {listMountGear(kind).map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.rowName}>
                      {entry.name}
                    </th>
                    <td>{entry.classifications.map((category) => t(`sheet.mountCategory.${category}`)).join(', ')}</td>
                    <td>{entry.price}</td>
                    <td>
                      {[entry.notes ?? '', entry.proprietaryOnly ? t('reference.proprietaryOnly') : ''].filter(Boolean).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
