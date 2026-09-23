import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ABYSS_CURSES, ADDITIONAL_ABYSS_CURSES, abyssSkillsFor, enhancementsFor, type AbyssTarget } from '../../data/abyss';
import { listAspectsByLevel } from '../../data/aspects';
import {
  COMBAT_OPENING_DISTANCES,
  MOVEMENT_DISTANCES,
  SKIRMISH_RANGE,
  SURPRISE_MODIFIERS,
} from '../../data/advanced-combat';
import { listArtsByKind, type ArtKind } from '../../data/arts';
import { COMBAT_FEATS } from '../../data/combat-feats';
import { CONSUMABLE_PRESETS } from '../../data/consumables';
import { listEssenceWeavingsByLevel } from '../../data/essence-weavings';
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
import { getRace } from '../../data/races';
import { SCHOOLS, listSecretsBySchool } from '../../data/schools';
import { STUNTS } from '../../data/stunts';
import { listManeuversByLevel, listStratagemsByLevel } from '../../data/tactician';
import { CATALOGUED_SCHOOLS, listSpellsBySchool } from '../../data/spells';
import {
  getTreasureDropTable,
  TREASURE_DROP_TABLES,
  TREASURE_ENHANCEMENT_ABILITIES,
  TREASURE_POINTS_ESTIMATE,
} from '../../data/treasure-drop';
import {
  ADOLESCENT_EXPERIENCE_TABLES,
  getChildhoodExperienceTable,
  listCategoriesForRace,
  listVagrantRaceIds,
  listVagrantTypesByCategory,
  VAGRANT_CATEGORIES,
  type VagrantCategory,
} from '../../data/vagrant';
import { listWorkSkillsByCategory, WORK_SKILL_CATEGORIES } from '../../data/work-skills';
import { ABILITY_IDS } from '../../lib/formulas/abilities';
import { COMBAT_FEAT_CATEGORIES } from '../../types/character';
import styles from './ReferenceView.module.css';

export function SpellsReference() {
  const { t, i18n } = useTranslation();
  const [school, setSchool] = useState(CATALOGUED_SCHOOLS[0]);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const all = listSpellsBySchool(school);
  const spells = query ? all.filter((spell) => spell.name.toLowerCase().includes(query)) : all;
  const withEffect = spells.filter((spell) => i18n.exists(`reference.spellEffect.${spell.id}`));

  return (
    <section className={styles.panel} aria-labelledby="reference-spells">
      <div className={styles.panelHead}>
        <h3 id="reference-spells">{t('reference.tab.spells')}</h3>
        <p className={styles.note}>{t('reference.spellsNote')}</p>
        <p className={styles.note}>{t('reference.spellEffectsNote')}</p>
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
      {withEffect.length > 0 && (
        <ul>
          {withEffect.map((spell) => (
            <li key={spell.id}>
              <strong>{spell.name}.</strong> {t(`reference.spellEffect.${spell.id}`)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CombatFeatsReference() {
  const { t, i18n } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-feats">
      <div className={styles.panelHead}>
        <h3 id="reference-feats">{t('reference.tab.feats')}</h3>
        <p className={styles.note}>{t('reference.featsNote')}</p>
        <p className={styles.note}>{t('reference.featEffectsNote')}</p>
      </div>

      {COMBAT_FEAT_CATEGORIES.map((category) => {
        const feats = COMBAT_FEATS.filter((feat) => feat.category === category);
        const withEffect = feats.filter((feat) => i18n.exists(`reference.combatFeatEffect.${feat.id}`));

        return (
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
                  {feats.map((feat) => (
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
            {withEffect.length > 0 && (
              <ul>
                {withEffect.map((feat) => (
                  <li key={feat.id}>
                    <strong>{feat.name}.</strong> {t(`reference.combatFeatEffect.${feat.id}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
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
  const { t, i18n } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-arts">
      <div className={styles.panelHead}>
        <h3 id="reference-arts">{t('reference.tab.arts')}</h3>
        <p className={styles.note}>{t('reference.artsNote')}</p>
      </div>

      {ART_KINDS.map((kind) => {
        const arts = listArtsByKind(kind);
        const withEffect = arts.filter((art) => i18n.exists(`reference.artEffect.${art.id}`));

        return (
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
                  {arts.map((art) => (
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
            {withEffect.length > 0 && (
              <ul>
                {withEffect.map((art) => (
                  <li key={art.id}>
                    <strong>{art.name}.</strong> {t(`reference.artEffect.${art.id}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
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
        <h4>{t('sheet.abyssKindSkill')}</h4>
        <p className={styles.note}>{t('reference.abyssSkillsNote')}</p>
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
                  <td>{abyssSkillsFor(target).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.additionalAbyssCurse')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.roll2d')}</th>
                <th>{t('sheet.name')}</th>
              </tr>
            </thead>
            <tbody>
              {ADDITIONAL_ABYSS_CURSES.map((curse) => (
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

      <div className={styles.group}>
        <h4>{t('sheet.stunts')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.requiredLevel')}</th>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.stuntType')}</th>
                <th>{t('sheet.stuntPrerequisite')}</th>
                <th>{t('sheet.stuntCompatible')}</th>
                <th>{t('sheet.stuntArea')}</th>
              </tr>
            </thead>
            <tbody>
              {STUNTS.map((entry) => (
                <tr key={entry.id}>
                  <td className={styles.numeric}>{entry.requiredLevel}</td>
                  <th scope="row" className={styles.rowName}>
                    {entry.name}
                  </th>
                  <td>{t(`sheet.stuntTypeName.${entry.type}`)}</td>
                  <td>{entry.prerequisite ?? '—'}</td>
                  <td>{entry.compatible.map((category) => t(`sheet.mountCategory.${category}`)).join(', ')}</td>
                  <td>{entry.area}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const ASPECT_LEVELS = [1, 5, 10] as const;

export function GeomancerReference() {
  const { t } = useTranslation();
  const geographs = GENERAL_ITEMS.filter((item) => item.sourceBook === 'Magus Arts');

  return (
    <section className={styles.panel} aria-labelledby="reference-geomancer">
      <div className={styles.panelHead}>
        <h3 id="reference-geomancer">{t('reference.tab.geomancer')}</h3>
        <p className={styles.note}>{t('reference.geomancerNote')}</p>
      </div>

      {ASPECT_LEVELS.map((level) => (
        <div key={level} className={styles.group}>
          <h4>{t('sheet.levelRequired', { level })}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.aspectDomain')}</th>
                  <th>{t('sheet.duration')}</th>
                  <th>{t('sheet.damageType')}</th>
                </tr>
              </thead>
              <tbody>
                {listAspectsByLevel(level).map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.rowName}>
                      {entry.name}
                    </th>
                    <td>
                      {t(`sheet.qiDomain.${entry.domain}`)} {entry.cost}
                    </td>
                    <td>{t(`sheet.duration_${entry.duration === '10s' ? '10s' : 'instant'}`)}</td>
                    <td>{entry.damageType ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className={styles.group}>
        <h4>{t('reference.tab.equipment')}: Geographs</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('reference.price')}</th>
                <th>{t('sheet.itemNote')}</th>
              </tr>
            </thead>
            <tbody>
              {geographs.map((entry) => (
                <tr key={entry.id}>
                  <th scope="row" className={styles.rowName}>
                    {entry.name}
                  </th>
                  <td className={styles.numeric}>{entry.price}</td>
                  <td>{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const STRATAGEM_LEVELS = [1, 5, 10] as const;
const MANEUVER_LEVELS = [1, 5] as const;

export function TacticianReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-tactician">
      <div className={styles.panelHead}>
        <h3 id="reference-tactician">{t('reference.tab.tactician')}</h3>
        <p className={styles.note}>{t('reference.tacticianNote')}</p>
      </div>

      <h4>{t('sheet.stratagems')}</h4>
      {STRATAGEM_LEVELS.map((level) => (
        <div key={level} className={styles.group}>
          <h4>{t('sheet.levelRequired', { level })}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.stratagemType')}</th>
                  <th>{t('sheet.stratagemRank')}</th>
                  <th>{t('sheet.edge')}</th>
                </tr>
              </thead>
              <tbody>
                {listStratagemsByLevel(level).map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.rowName}>
                      {entry.name}
                    </th>
                    <td>{t(`sheet.stratagemTypeName.${entry.type}`)}</td>
                    <td className={styles.numeric}>{entry.rank}</td>
                    <td>{entry.edgeCost > 0 ? `-${entry.edgeCost}` : `+${entry.edgeAccumulation}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <h4>{t('sheet.maneuvers')}</h4>
      {MANEUVER_LEVELS.map((level) => (
        <div key={level} className={styles.group}>
          <h4>{t('sheet.levelRequired', { level })}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.edge')}</th>
                  <th>{t('sheet.stuntPrerequisite')}</th>
                </tr>
              </thead>
              <tbody>
                {listManeuversByLevel(level).map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.rowName}>
                      {entry.name}
                    </th>
                    <td className={styles.numeric}>{entry.edgeCost > 0 ? `-${entry.edgeCost}` : '—'}</td>
                    <td>{entry.prerequisite ?? entry.condition ?? '—'}</td>
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

const ESSENCE_WEAVING_LEVELS = [1, 5, 10] as const;

export function EssenceWeavingReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-essence-weavings">
      <div className={styles.panelHead}>
        <h3 id="reference-essence-weavings">{t('reference.tab.essenceWeavings')}</h3>
        <p className={styles.note}>{t('reference.essenceWeavingsNote')}</p>
      </div>

      {ESSENCE_WEAVING_LEVELS.map((level) => (
        <div key={level} className={styles.group}>
          <h4>{t('sheet.levelRequired', { level })}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.stuntType')}</th>
                  <th>{t('sheet.essenceWeavingCost')}</th>
                  <th>{t('sheet.stuntPrerequisite')}</th>
                </tr>
              </thead>
              <tbody>
                {listEssenceWeavingsByLevel(level).map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.rowName}>
                      {entry.name}
                      {entry.usableInPreparation ? ` (${t('sheet.essenceWeavingPreparation')})` : ''}
                    </th>
                    <td>{t(`sheet.stuntTypeName.${entry.type}`)}</td>
                    <td className={styles.numeric}>{entry.cost}</td>
                    <td>{entry.prerequisite ?? '—'}</td>
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

export function SchoolsReference() {
  const { t, i18n } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-schools">
      <div className={styles.panelHead}>
        <h3 id="reference-schools">{t('reference.tab.schools')}</h3>
        <p className={styles.note}>{t('reference.schoolsNote')}</p>
      </div>

      {SCHOOLS.map((sch) => {
        const secrets = listSecretsBySchool(sch.id);
        const withEffect = secrets.filter((entry) => i18n.exists(`reference.schoolSecretEffect.${entry.id}`));

        return (
          <div key={sch.id} className={styles.group}>
            <h4>
              {sch.name}{' '}
              <span className={styles.numeric}>
                ({t('sheet.schoolInitiationReputation')} {sch.initiationReputation}
                {sch.initiationNotes ? `, ${sch.initiationNotes}` : ''})
              </span>
            </h4>

            {sch.equipment && sch.equipment.length > 0 && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t('sheet.name')}</th>
                      <th>{t('reference.price')}</th>
                      <th>{t('sheet.itemNote')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sch.equipment.map((item) => (
                      <tr key={item.name}>
                        <th scope="row" className={styles.rowName}>
                          {item.name}
                        </th>
                        <td className={styles.numeric}>{item.price}</td>
                        <td>{item.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sch.secretsNote ? (
              <p className={styles.note}>{sch.secretsNote}</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t('sheet.name')}</th>
                      <th>{t('sheet.secretType')}</th>
                      <th>{t('sheet.essenceWeavingCost')}</th>
                      <th>{t('sheet.stuntPrerequisite')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secrets.map((entry) => (
                      <tr key={entry.id}>
                        <th scope="row" className={styles.rowName}>
                          {entry.name}
                        </th>
                        <td>{t(`sheet.combatFeatCategory.${entry.type}`)}</td>
                        <td className={styles.numeric}>{entry.requiredReputation}</td>
                        <td>{entry.prerequisite && entry.prerequisite !== 'None' ? entry.prerequisite : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {withEffect.length > 0 && (
              <ul>
                {withEffect.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.name}.</strong> {t(`reference.schoolSecretEffect.${entry.id}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}

const WORK_SKILL_BONUS_LEVELS = ['level5', 'level10', 'level15'] as const;

export function WorkSkillsReference() {
  const { t, i18n } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-work-skills">
      <div className={styles.panelHead}>
        <h3 id="reference-work-skills">{t('reference.tab.workSkills')}</h3>
        <p className={styles.note}>{t('reference.workSkillsNote')}</p>
      </div>

      {WORK_SKILL_CATEGORIES.map((category) => (
        <div key={category} className={styles.group}>
          <h4>{t(`sheet.workSkillCategory.${category}`)}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('reference.workSkillProfession')}</th>
                  <th>{t('reference.book')}</th>
                </tr>
              </thead>
              <tbody>
                {listWorkSkillsByCategory(category).map((entry) => (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.rowName}>
                      {entry.name}
                    </th>
                    <td>{entry.profession}</td>
                    <td>Raxia Life p. {entry.page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {listWorkSkillsByCategory(category)
            .filter((entry) => i18n.exists(`reference.workSkillDescription.${entry.id}`))
            .map((entry) => {
              const withCheckEffect = entry.checks.filter((c) =>
                i18n.exists(`reference.workSkillCheckEffect.${entry.id}.${c.id}`),
              );
              const hasBonuses = i18n.exists(`reference.workSkillBonus.${entry.id}.level5`);

              return (
                <div key={entry.id} className={styles.group}>
                  <p className={styles.subheading}>
                    {entry.name} — {entry.profession}
                  </p>
                  <p>{t(`reference.workSkillDescription.${entry.id}`)}</p>

                  {entry.checks.length > 0 && (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>{t('sheet.name')}</th>
                            <th>{t('reference.workSkillAbility')}</th>
                            <th>{t('reference.workSkillTimeRequired')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.checks.map((c) => (
                            <tr key={c.id}>
                              <th scope="row" className={styles.rowName}>
                                {c.name}
                              </th>
                              <td>{c.ability}</td>
                              <td>{c.reference ? `${t('reference.workSkillSeePrefix')} ${c.reference}` : c.timeRequired}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {withCheckEffect.length > 0 && (
                    <ul>
                      {withCheckEffect.map((c) => (
                        <li key={c.id}>
                          <strong>{c.name}.</strong> {t(`reference.workSkillCheckEffect.${entry.id}.${c.id}`)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {hasBonuses && (
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>{t('sheet.requiredLevel')}</th>
                            <th>{t('reference.workSkillBonusLabel')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {WORK_SKILL_BONUS_LEVELS.map((level) => (
                            <tr key={level}>
                              <th scope="row" className={styles.numeric}>
                                {level.replace('level', '')}
                              </th>
                              <td>{t(`reference.workSkillBonus.${entry.id}.${level}`)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </section>
  );
}

export function TreasureDropReference() {
  const { t } = useTranslation();
  const [tableId, setTableId] = useState(TREASURE_DROP_TABLES[0].id);
  const table = getTreasureDropTable(tableId) ?? TREASURE_DROP_TABLES[0];

  return (
    <section className={styles.panel} aria-labelledby="reference-treasure-drop">
      <div className={styles.panelHead}>
        <h3 id="reference-treasure-drop">{t('reference.tab.treasureDrop')}</h3>
        <p className={styles.note}>{t('reference.treasureDropNote')}</p>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.treasurePointsEstimate')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.adventurerLevelTotal')}</th>
                <th>{t('reference.treasurePoints')}</th>
              </tr>
            </thead>
            <tbody>
              {TREASURE_POINTS_ESTIMATE.map((estimate) => (
                <tr key={estimate.levelRange}>
                  <th scope="row" className={styles.rowName}>
                    {estimate.levelRange}
                  </th>
                  <td className={styles.numeric}>{estimate.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.treasureEnhancementAbilities')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                {Array.from({ length: 10 }, (_, index) => (
                  <th key={index} className={styles.numeric}>
                    {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TREASURE_ENHANCEMENT_ABILITIES.map((ability) => (
                <tr key={ability.name}>
                  <th scope="row" className={styles.rowName}>
                    {ability.name}
                  </th>
                  {ability.costs.map((cost, index) => (
                    <td key={index} className={styles.numeric}>
                      {cost ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul>
          {TREASURE_ENHANCEMENT_ABILITIES.map((ability) => (
            <li key={ability.name}>
              <strong>{ability.name}.</strong> {ability.description}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.group}>
        <div className={styles.controlRow}>
          <label htmlFor="reference-treasure-table">{t('reference.treasureDropTable')}</label>
          <select id="reference-treasure-table" value={tableId} onChange={(event) => setTableId(event.target.value)}>
            {TREASURE_DROP_TABLES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.table} ({entry.points} {t('reference.treasurePointsShort')})
              </option>
            ))}
          </select>
        </div>

        {table.groups.map((group) => (
          <div key={group.group} className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>1d {group.group}</th>
                  <th>{t('sheet.name')}</th>
                  <th>{t('reference.category')}</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((item, index) => (
                  <tr key={`${group.group}-${index}`}>
                    <th scope="row" className={styles.numeric}>
                      {index + 1}
                    </th>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {table.footnotes && table.footnotes.length > 0 && <p className={styles.note}>{table.footnotes.join(' ')}</p>}
      </div>
    </section>
  );
}

const VAGRANT_CATEGORY_LABEL_KEY: Record<VagrantCategory, string> = {
  warrior: 'warrior',
  spy: 'spy',
  remoteSupport: 'remoteSupport',
  magicWarrior: 'magicWarrior',
};

export function VagrantReference() {
  const { t } = useTranslation();
  const raceIds = listVagrantRaceIds();
  const [childhoodRace, setChildhoodRace] = useState(raceIds[0]);
  const childhoodCategories = listCategoriesForRace(childhoodRace);
  const [childhoodCategory, setChildhoodCategory] = useState<VagrantCategory>(childhoodCategories[0]);
  const activeChildhoodCategory = childhoodCategories.includes(childhoodCategory) ? childhoodCategory : childhoodCategories[0];
  const childhoodTable = getChildhoodExperienceTable(childhoodRace, activeChildhoodCategory);

  const allTypes = VAGRANT_CATEGORIES.flatMap((category) => listVagrantTypesByCategory(category));
  const [vagrantTypeId, setVagrantTypeId] = useState(allTypes[0].id);
  const vagrantType = allTypes.find((type) => type.id === vagrantTypeId);

  const [adolescentId, setAdolescentId] = useState(ADOLESCENT_EXPERIENCE_TABLES[0].id);
  const adolescentTable = ADOLESCENT_EXPERIENCE_TABLES.find((table) => table.id === adolescentId) ?? ADOLESCENT_EXPERIENCE_TABLES[0];

  return (
    <section className={styles.panel} aria-labelledby="reference-vagrant">
      <div className={styles.panelHead}>
        <h3 id="reference-vagrant">{t('reference.tab.vagrant')}</h3>
        <p className={styles.note}>{t('reference.vagrantNote')}</p>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.vagrantTypes')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('reference.vagrantCategoryHeader')}</th>
                <th>{t('reference.vagrantCourses')}</th>
                <th>{t('reference.vagrantPrimaryClass')}</th>
                <th>{t('reference.vagrantSubclass')}</th>
                <th>{t('reference.vagrantRemainingXp')}</th>
                <th>{t('reference.vagrantLanguages')}</th>
                <th>{t('reference.vagrantSpecialNotes')}</th>
              </tr>
            </thead>
            <tbody>
              {allTypes.map((type) => (
                <tr key={type.id}>
                  <th scope="row" className={styles.rowName}>
                    {type.name}
                  </th>
                  <td>{t(`reference.vagrantCategory.${VAGRANT_CATEGORY_LABEL_KEY[type.category]}`)}</td>
                  <td>{type.courses}</td>
                  <td>{type.primaryClass}</td>
                  <td>{type.subclass ?? '—'}</td>
                  <td>{type.remainingXp}</td>
                  <td>{type.additionalLanguages}</td>
                  <td className={styles.prose}>{type.specialNotes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.vagrantSelectableRaces')}</h4>
        <div className={styles.controlRow}>
          <label htmlFor="reference-vagrant-type">{t('reference.vagrantTypes')}</label>
          <select id="reference-vagrant-type" value={vagrantTypeId} onChange={(event) => setVagrantTypeId(event.target.value)}>
            {VAGRANT_CATEGORIES.map((category) => (
              <optgroup key={category} label={t(`reference.vagrantCategory.${VAGRANT_CATEGORY_LABEL_KEY[category]}`)}>
                {listVagrantTypesByCategory(category).map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {vagrantType && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('reference.race')}</th>
                  <th>{t('creation.background')}</th>
                  <th>
                    {t('creation.skill')} / {t('creation.body')} / {t('creation.mind')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {vagrantType.selectableRaces.map((entry) => (
                  <tr key={entry.raceId}>
                    <th scope="row" className={styles.rowName}>
                      {getRace(entry.raceId)?.name ?? entry.raceId}
                    </th>
                    <td>{entry.background}</td>
                    <td className={styles.numeric}>{entry.skillBodyMind.join('/')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.group}>
        <h4>{t('reference.vagrantChildhood')}</h4>
        <p className={styles.note}>{t('reference.vagrantChildhoodNote')}</p>
        <div className={styles.controlRow}>
          <label htmlFor="reference-vagrant-childhood-race">{t('reference.race')}</label>
          <select
            id="reference-vagrant-childhood-race"
            value={childhoodRace}
            onChange={(event) => setChildhoodRace(event.target.value)}
          >
            {raceIds.map((raceId) => (
              <option key={raceId} value={raceId}>
                {getRace(raceId)?.name ?? raceId}
              </option>
            ))}
          </select>
          <label htmlFor="reference-vagrant-childhood-category">{t('reference.vagrantCategoryHeader')}</label>
          <select
            id="reference-vagrant-childhood-category"
            value={activeChildhoodCategory}
            onChange={(event) => setChildhoodCategory(event.target.value as VagrantCategory)}
          >
            {childhoodCategories.map((category) => (
              <option key={category} value={category}>
                {t(`reference.vagrantCategory.${VAGRANT_CATEGORY_LABEL_KEY[category]}`)}
              </option>
            ))}
          </select>
        </div>
        {childhoodTable && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('reference.vagrantRoll')}</th>
                  <th>{t('reference.vagrantDeprecated')}</th>
                  <th>{t('reference.vagrantExperienceFocus')}</th>
                  {ABILITY_IDS.map((id) => (
                    <th key={id} className={styles.numeric}>
                      {id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {childhoodTable.rows.map((row, index) => (
                  <tr key={`${row.roll}-${index}`}>
                    <th scope="row" className={styles.numeric}>
                      {row.roll}
                    </th>
                    <td>{row.deprecatedTypes.length > 0 ? row.deprecatedTypes.join(', ') : '—'}</td>
                    <td>
                      {row.experience}
                      {row.focus && <span className={styles.range}>{row.focus}</span>}
                    </td>
                    {ABILITY_IDS.map((id) => (
                      <td key={id} className={styles.numeric}>
                        {row.correction[id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.group}>
        <h4>{t('reference.vagrantAdolescent')}</h4>
        <div className={styles.controlRow}>
          <label htmlFor="reference-vagrant-adolescent">{t('reference.vagrantAdolescent')}</label>
          <select id="reference-vagrant-adolescent" value={adolescentId} onChange={(event) => setAdolescentId(event.target.value)}>
            {ADOLESCENT_EXPERIENCE_TABLES.map((table) => (
              <option key={table.id} value={table.id}>
                {table.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.vagrantRoll')}</th>
                <th>{t('sheet.name')}</th>
                <th>{t('reference.vagrantCombatFeat')}</th>
              </tr>
            </thead>
            <tbody>
              {adolescentTable.rows.map((row, index) => (
                <tr key={`${row.roll}-${index}`}>
                  <th scope="row" className={styles.numeric}>
                    {row.roll}
                  </th>
                  <td>{row.experience}</td>
                  <td>{row.combatFeats.join(' / ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function AdvancedCombatReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-advanced-combat">
      <div className={styles.panelHead}>
        <h3 id="reference-advanced-combat">{t('reference.tab.advancedCombat')}</h3>
        <p className={styles.note}>{t('reference.advancedCombatNote')}</p>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.combatOpeningDistances')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.situation')}</th>
                <th>{t('reference.distance')}</th>
              </tr>
            </thead>
            <tbody>
              {COMBAT_OPENING_DISTANCES.map((row) => (
                <tr key={row.situation}>
                  <th scope="row" className={styles.rowName}>
                    {row.situation}
                  </th>
                  <td>{row.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.movementDistances')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.movementType')}</th>
                <th>{t('reference.distance')}</th>
              </tr>
            </thead>
            <tbody>
              {MOVEMENT_DISTANCES.map((row) => (
                <tr key={row.type}>
                  <th scope="row" className={styles.rowName}>
                    {row.type}
                  </th>
                  <td>{row.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.skirmishRange')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.participants')}</th>
                <th>{t('reference.outdoorRadius')}</th>
                <th>{t('reference.indoorSize')}</th>
              </tr>
            </thead>
            <tbody>
              {SKIRMISH_RANGE.map((row) => (
                <tr key={row.participants}>
                  <th scope="row" className={styles.rowName}>
                    {row.participants}
                  </th>
                  <td>{row.outdoorRadius}</td>
                  <td>{row.indoorSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.surpriseModifiers')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.condition')}</th>
                <th>{t('reference.modification')}</th>
              </tr>
            </thead>
            <tbody>
              {SURPRISE_MODIFIERS.map((row) => (
                <tr key={row.condition}>
                  <th scope="row" className={styles.rowName}>
                    {row.condition}
                  </th>
                  <td>{row.modification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
