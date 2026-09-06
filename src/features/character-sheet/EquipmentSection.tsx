import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EQUIPMENT_RANKS, type AbyssEnhancement, type Accessory, type Armor, type Character, type InventoryItem, type Shield, type Weapon } from '../../types/character';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { evasion as baseEvasionFormula } from '../../lib/formulas/derived-stats';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { meetsStrength, requiredStrength } from '../../lib/formulas/requirements';
import { totalDefense, totalEvasion, weaponTotalAccuracy, weaponTotalExtraDamage } from '../../lib/formulas/weapon-stats';
import { ABYSS_CURSES, MAX_ABYSS_ENHANCEMENTS, enhancementsFor, getAbyssCurse, type AbyssTarget } from '../../data/abyss';
import { getClass } from '../../data/classes';
import { CONSUMABLE_PRESETS } from '../../data/consumables';
import {
  ARMORS,
  GENERAL_ITEM_NAMES,
  SHIELDS,
  WEAPON_CATEGORIES,
  getArmor,
  getShield,
  getWeapon,
  listWeaponsByCategory,
  type WeaponDefinition,
  type WeaponStanceRow,
} from '../../data/equipment';
import { useUpdateCharacter } from '../../state/characters';
import { autoGrow } from './autoGrow';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

function primaryWarriorLevel(character: Character): number {
  return character.classes
    .filter((classLevel) => getClass(classLevel.classId)?.type === 'warrior')
    .reduce((max, classLevel) => Math.max(max, classLevel.level), 0);
}

function newWeapon(): Weapon {
  return { id: crypto.randomUUID(), name: '', stance: '1H', minStr: 0, accuracyBonus: 0, power: 1, criticalValue: 10, extraDamageBonus: 0, rank: 'B', abyss: [] };
}

function newArmor(): Armor {
  return { id: crypto.randomUUID(), name: '', defense: 0, evasionModifier: 0, minStr: 0, rank: 'B', abyss: [] };
}

function newShield(): Shield {
  return { id: crypto.randomUUID(), name: '', defenseBonus: 0, evasionBonus: 0, minStr: 0, notes: '', rank: 'B', abyss: [] };
}

/** The sheet stores 1H/2H/special; the book prints 1HR, 1H*, 1HW, 1H#, 2Hs, 2Hp and so on.
 *  Every one of those still is a one- or two-handed weapon for feats and restrictions
 *  (Core I p. 264), so the code maps down and the exact marker is kept in the row's note —
 *  it is what tells a Jockey which line to use while mounted. */
function stanceOf(code: string): Weapon['stance'] {
  if (code.startsWith('1H')) return '1H';
  if (code.startsWith('2H')) return '2H';
  return 'special';
}

function joinNotes(...parts: (string | undefined)[]): string {
  return parts.filter((part): part is string => Boolean(part)).join(' · ');
}

/** One catalog line becomes one weapon row. A weapon printed with two grips gives one row
 *  per grip, because Power and Crit differ between them and a row stores a single set. */
function weaponRowFrom(definition: WeaponDefinition, stanceRow: WeaponStanceRow): Weapon {
  const stanceNote = stanceRow.stance === '1H' || stanceRow.stance === '2H' ? undefined : stanceRow.stance;
  return {
    id: crypto.randomUUID(),
    name: definition.name,
    stance: stanceOf(stanceRow.stance),
    minStr: stanceRow.minStr,
    accuracyBonus: stanceRow.accuracy,
    // Guns print no Power — the bullet carries it — so the row starts at 0 for the player
    // to fill in from the ammunition they load.
    power: stanceRow.power ?? 0,
    criticalValue: stanceRow.criticalValue,
    extraDamageBonus: stanceRow.extraDamage,
    range: definition.range,
    rank: definition.rank,
    notes: joinNotes(stanceNote, definition.magazine ? `Magazine ${definition.magazine}` : undefined, definition.notes) || undefined,
    abyss: [],
  };
}

function newAccessory(): Accessory {
  return { id: crypto.randomUUID(), name: '' };
}

/** Weapons, armor and the shield all take Abyss Enhancements, so the section works over
 *  a flat view of them; storing each enhancement on its own item is what keeps a removed
 *  weapon from leaving orphaned rows behind. */
interface AbyssHolder {
  id: string;
  name: string;
  target: AbyssTarget;
  abyss: AbyssEnhancement[];
}

function abyssHolders(character: Character): AbyssHolder[] {
  const { weapons, armor, shield } = character.equipment;
  return [
    ...weapons.map((weapon) => ({ id: weapon.id, name: weapon.name, target: 'weapon' as const, abyss: weapon.abyss })),
    ...armor.map((piece) => ({ id: piece.id, name: piece.name, target: 'armor' as const, abyss: piece.abyss })),
    ...(shield ? [{ id: shield.id, name: shield.name, target: 'shield' as const, abyss: shield.abyss }] : []),
  ];
}

function newItem(): InventoryItem {
  return { id: crypto.randomUUID(), name: '', quantity: 1, weight: '', notes: '' };
}

/** Suggestion list shared by every inventory row; a page only ever shows one sheet. */
const CONSUMABLES_LIST_ID = 'consumable-presets';

export function EquipmentSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [abyssTargetId, setAbyssTargetId] = useState('');
  // A weapon printed with two grips is two options, so the picker's value carries the row
  // index alongside the catalog id.
  const [weaponPick, setWeaponPick] = useState('');
  const [armorPick, setArmorPick] = useState('');
  const [shieldPick, setShieldPick] = useState('');

  const strTotal = abilityTotal(character.abilities.STR);
  // A Fencer halves a weapon's requirement — armor and shields keep theirs.
  const isFencer = character.classes.some((classLevel) => classLevel.classId === 'fencer');

  /** The requirement marker shown beside a Min STR the character cannot meet. */
  function strengthWarning(minStr: number, halved: boolean) {
    if (meetsStrength(strTotal, minStr, halved)) return null;
    const needed = requiredStrength(minStr, halved);
    return (
      <span className={styles.unmetMark} title={t('sheet.strengthShort', { needed, have: strTotal })}>
        ⚠
      </span>
    );
  }

  const holders = abyssHolders(character);
  const enhanceable = holders.filter((holder) => holder.abyss.length < MAX_ABYSS_ENHANCEMENTS);
  const abyssRows = holders.flatMap((holder) => holder.abyss.map((enhancement) => ({ holder, enhancement })));
  const activeAbyssTarget = enhanceable.find((holder) => holder.id === abyssTargetId) ?? enhanceable[0];

  const inventory = character.equipment.inventory;
  const inventoryEmpty = inventory.adventurersSet === '' && inventory.items.length === 0 && inventory.ammoType === '' && inventory.ammoCount === 0;

  const dexMod = abilityModifier(abilityTotal(character.abilities.DEX));
  const strMod = abilityModifier(abilityTotal(character.abilities.STR));
  const agiMod = abilityModifier(abilityTotal(character.abilities.AGI));
  const warriorLevel = primaryWarriorLevel(character);
  const baseEvasion = baseEvasionFormula(warriorLevel, agiMod);

  const defense =
    totalDefense(character.equipment.armor.map((a) => a.defense), character.equipment.shield?.defenseBonus ?? 0) +
    sumModifiersForField(character.statusEffects, 'defense');
  const evasionTotal =
    totalEvasion(baseEvasion, character.equipment.armor.map((a) => a.evasionModifier), character.equipment.shield?.evasionBonus ?? 0) +
    sumModifiersForField(character.statusEffects, 'evasion');

  function updateWeapon(id: string, patch: Partial<Weapon>) {
    update((c) => ({ ...c, equipment: { ...c.equipment, weapons: c.equipment.weapons.map((w) => (w.id === id ? { ...w, ...patch } : w)) } }));
  }
  function addWeapon() {
    update((c) => ({ ...c, equipment: { ...c.equipment, weapons: [...c.equipment.weapons, newWeapon()] } }));
  }
  function addWeaponFromCatalog() {
    const [id, index] = weaponPick.split('#');
    const definition = getWeapon(id);
    const stanceRow = definition?.rows[Number(index)];
    if (!definition || !stanceRow) return;
    const row = weaponRowFrom(definition, stanceRow);
    update((c) => ({ ...c, equipment: { ...c.equipment, weapons: [...c.equipment.weapons, row] } }));
    setWeaponPick('');
  }
  function removeWeapon(id: string) {
    update((c) => ({ ...c, equipment: { ...c.equipment, weapons: c.equipment.weapons.filter((w) => w.id !== id) } }));
  }

  function updateArmor(id: string, patch: Partial<Armor>) {
    update((c) => ({ ...c, equipment: { ...c.equipment, armor: c.equipment.armor.map((a) => (a.id === id ? { ...a, ...patch } : a)) } }));
  }
  function addArmor() {
    update((c) => ({ ...c, equipment: { ...c.equipment, armor: [...c.equipment.armor, newArmor()] } }));
  }
  function addArmorFromCatalog() {
    const definition = getArmor(armorPick);
    if (!definition) return;
    const row: Armor = {
      id: crypto.randomUUID(),
      name: definition.name,
      defense: definition.defense,
      evasionModifier: definition.evasion,
      minStr: definition.minStr,
      rank: definition.rank,
      notes: definition.notes,
      abyss: [],
    };
    update((c) => ({ ...c, equipment: { ...c.equipment, armor: [...c.equipment.armor, row] } }));
    setArmorPick('');
  }
  function removeArmor(id: string) {
    update((c) => ({ ...c, equipment: { ...c.equipment, armor: c.equipment.armor.filter((a) => a.id !== id) } }));
  }

  function updateAccessory(id: string, patch: Partial<Accessory>) {
    update((c) => ({ ...c, equipment: { ...c.equipment, accessories: c.equipment.accessories.map((a) => (a.id === id ? { ...a, ...patch } : a)) } }));
  }
  function addAccessory() {
    update((c) => ({ ...c, equipment: { ...c.equipment, accessories: [...c.equipment.accessories, newAccessory()] } }));
  }
  function removeAccessory(id: string) {
    update((c) => ({ ...c, equipment: { ...c.equipment, accessories: c.equipment.accessories.filter((a) => a.id !== id) } }));
  }

  function setShield(patch: Partial<Shield> | null) {
    update((c) => ({
      ...c,
      equipment: {
        ...c.equipment,
        shield: patch === null ? null : { ...(c.equipment.shield ?? newShield()), ...patch },
      },
    }));
  }
  function addShieldFromCatalog() {
    const definition = getShield(shieldPick);
    if (!definition) return;
    setShield({
      name: definition.name,
      defenseBonus: definition.defense,
      evasionBonus: definition.evasion,
      minStr: definition.minStr,
      rank: definition.rank,
      notes: joinNotes(definition.mountProtection ? t('sheet.mountProtection') : undefined, definition.notes),
    });
    setShieldPick('');
  }

  function setInventory(patch: Partial<Character['equipment']['inventory']>) {
    update((c) => ({ ...c, equipment: { ...c.equipment, inventory: { ...c.equipment.inventory, ...patch } } }));
  }
  function updateItem(id: string, patch: Partial<InventoryItem>) {
    update((c) => ({
      ...c,
      equipment: {
        ...c.equipment,
        inventory: { ...c.equipment.inventory, items: c.equipment.inventory.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) },
      },
    }));
  }
  function addItem() {
    update((c) => ({ ...c, equipment: { ...c.equipment, inventory: { ...c.equipment.inventory, items: [...c.equipment.inventory.items, newItem()] } } }));
  }
  function removeItem(id: string) {
    update((c) => ({
      ...c,
      equipment: { ...c.equipment, inventory: { ...c.equipment.inventory, items: c.equipment.inventory.items.filter((item) => item.id !== id) } },
    }));
  }

  /** Rewrites the enhancement list of whichever weapon, armor or shield owns this id. */
  function updateAbyss(holderId: string, next: (list: AbyssEnhancement[]) => AbyssEnhancement[]) {
    update((c) => ({
      ...c,
      equipment: {
        ...c.equipment,
        weapons: c.equipment.weapons.map((weapon) => (weapon.id === holderId ? { ...weapon, abyss: next(weapon.abyss) } : weapon)),
        armor: c.equipment.armor.map((piece) => (piece.id === holderId ? { ...piece, abyss: next(piece.abyss) } : piece)),
        shield:
          c.equipment.shield && c.equipment.shield.id === holderId
            ? { ...c.equipment.shield, abyss: next(c.equipment.shield.abyss) }
            : c.equipment.shield,
      },
    }));
  }
  function addEnhancement() {
    if (!activeAbyssTarget) return;
    updateAbyss(activeAbyssTarget.id, (list) => [...list, { id: crypto.randomUUID(), type: '', notes: '', curseRoll: '', curseName: '' }]);
  }
  function updateEnhancement(holderId: string, enhancementId: string, patch: Partial<AbyssEnhancement>) {
    updateAbyss(holderId, (list) => list.map((enhancement) => (enhancement.id === enhancementId ? { ...enhancement, ...patch } : enhancement)));
  }
  function removeEnhancement(holderId: string, enhancementId: string) {
    updateAbyss(holderId, (list) => list.filter((enhancement) => enhancement.id !== enhancementId));
  }

  function setCurrency(field: 'cash' | 'savings' | 'debt', value: number) {
    update((c) => ({ ...c, currency: { ...c.currency, [field]: value } }));
  }
  function setSpendingLog(value: string) {
    update((c) => ({ ...c, currency: { ...c.currency, spendingLog: value } }));
  }

  return (
    <section className={styles.section} aria-labelledby="section-equipment">
      <div className={styles.sectionHead}>
        <h3 id="section-equipment">{t('sheet.equipment')}</h3>
        <p className={styles.sectionNote}>
          {t('sheet.totalDefense')}: <strong className={styles.numeric}>{defense}</strong> · {t('sheet.totalEvasion')}:{' '}
          <strong className={styles.numeric}>{evasionTotal}</strong>
        </p>
      </div>

      {/* data-print-empty drops the whole sub-block from print: its "Add …" button is
          hidden on paper anyway, leaving a heading over nothing. */}
      <div className={styles.subsection} data-print-empty={character.equipment.weapons.length === 0 || undefined}>
        <h4>{t('sheet.weapons')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.stance')}</th>
                <th>{t('sheet.minStr')}</th>
                <th>{t('sheet.accuracyBonus')}</th>
                <th>{t('sheet.totalAccuracy')}</th>
                <th>{t('sheet.power')}</th>
                <th>{t('sheet.criticalValue')}</th>
                <th>{t('sheet.extraDamageBonus')}</th>
                <th>{t('sheet.totalExtraDamage')}</th>
                <th>{t('sheet.rank')}</th>
                <th>{t('sheet.range')}</th>
                <th>{t('sheet.itemNote')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.equipment.weapons.map((weapon) => (
                <tr key={weapon.id}>
                  <td>
                    <PrintableField value={weapon.name} onChange={(e) => updateWeapon(weapon.id, { name: e.target.value })} aria-label={t('sheet.name')} />
                  </td>
                  <td>
                    <select value={weapon.stance} onChange={(e) => updateWeapon(weapon.id, { stance: e.target.value as Weapon['stance'] })} aria-label={t('sheet.stance')}>
                      <option value="1H">1H</option>
                      <option value="2H">2H</option>
                      <option value="special">{t('sheet.special')}</option>
                    </select>
                  </td>
                  <td className={meetsStrength(strTotal, weapon.minStr, isFencer) ? undefined : styles.unmet}>
                    <input type="number" value={weapon.minStr} onChange={(e) => updateWeapon(weapon.id, { minStr: Number(e.target.value) })} aria-label={t('sheet.minStr')} />
                    {strengthWarning(weapon.minStr, isFencer)}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={weapon.accuracyBonus}
                      onChange={(e) => updateWeapon(weapon.id, { accuracyBonus: Number(e.target.value) })}
                      aria-label={t('sheet.accuracyBonus')}
                    />
                  </td>
                  <td className={styles.numeric}>{weaponTotalAccuracy(warriorLevel, dexMod, weapon.accuracyBonus)}</td>
                  <td>
                    <input type="number" value={weapon.power} onChange={(e) => updateWeapon(weapon.id, { power: Number(e.target.value) })} aria-label={t('sheet.power')} />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={weapon.criticalValue}
                      onChange={(e) => updateWeapon(weapon.id, { criticalValue: Number(e.target.value) })}
                      aria-label={t('sheet.criticalValue')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={weapon.extraDamageBonus}
                      onChange={(e) => updateWeapon(weapon.id, { extraDamageBonus: Number(e.target.value) })}
                      aria-label={t('sheet.extraDamageBonus')}
                    />
                  </td>
                  <td className={styles.numeric}>{weaponTotalExtraDamage(warriorLevel, strMod, weapon.extraDamageBonus)}</td>
                  <td>
                    <select value={weapon.rank} onChange={(e) => updateWeapon(weapon.id, { rank: e.target.value as Weapon['rank'] })} aria-label={t('sheet.rank')}>
                      {EQUIPMENT_RANKS.map((rank) => (
                        <option key={rank} value={rank}>
                          {rank}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <PrintableField
                      value={weapon.range ?? ''}
                      onChange={(e) => updateWeapon(weapon.id, { range: e.target.value })}
                      aria-label={t('sheet.range')}
                    />
                  </td>
                  <td>
                    <PrintableField
                      value={weapon.notes ?? ''}
                      onChange={(e) => updateWeapon(weapon.id, { notes: e.target.value })}
                      aria-label={t('sheet.itemNote')}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeWeapon(weapon.id)}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* The catalog only holds what Core III adds, so the blank-row button stays the
            main way in: a Longsword is still typed by hand. */}
        <div className={`${styles.rowActions} ${styles.controlRow}`}>
          <label htmlFor="add-weapon-catalog">{t('sheet.weaponFromCatalog')}</label>
          <select id="add-weapon-catalog" value={weaponPick} onChange={(e) => setWeaponPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {WEAPON_CATEGORIES.map((category) => (
              <optgroup key={category} label={t(`sheet.weaponCategory.${category}`)}>
                {listWeaponsByCategory(category).flatMap((definition) =>
                  definition.rows.map((stanceRow, index) => (
                    <option key={`${definition.id}#${index}`} value={`${definition.id}#${index}`}>
                      {definition.name} ({definition.rank}) — {stanceRow.stance}
                      {stanceRow.power === undefined ? '' : `, ${t('sheet.power')} ${stanceRow.power}`}
                      {definition.price === undefined ? '' : `, ${definition.price.toLocaleString('ru-RU')} G`}
                    </option>
                  )),
                )}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addWeaponFromCatalog} disabled={!weaponPick} aria-label={t('sheet.addWeaponFromCatalog')}>
            {t('sheet.addFromCatalog')}
          </button>
          <button type="button" onClick={addWeapon}>
            {t('sheet.addWeapon')}
          </button>
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={character.equipment.armor.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.armor')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.defense')}</th>
                <th>{t('sheet.evasionModifier')}</th>
                <th>{t('sheet.minStr')}</th>
                <th>{t('sheet.rank')}</th>
                <th>{t('sheet.itemNote')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.equipment.armor.map((armor) => (
                <tr key={armor.id}>
                  <td>
                    <PrintableField value={armor.name} onChange={(e) => updateArmor(armor.id, { name: e.target.value })} aria-label={t('sheet.name')} />
                  </td>
                  <td>
                    <input type="number" value={armor.defense} onChange={(e) => updateArmor(armor.id, { defense: Number(e.target.value) })} aria-label={t('sheet.defense')} />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={armor.evasionModifier}
                      onChange={(e) => updateArmor(armor.id, { evasionModifier: Number(e.target.value) })}
                      aria-label={t('sheet.evasionModifier')}
                    />
                  </td>
                  <td className={meetsStrength(strTotal, armor.minStr) ? undefined : styles.unmet}>
                    <input type="number" value={armor.minStr} onChange={(e) => updateArmor(armor.id, { minStr: Number(e.target.value) })} aria-label={t('sheet.minStr')} />
                    {strengthWarning(armor.minStr, false)}
                  </td>
                  <td>
                    {/* EQUIPMENT_RANKS, not a hand-written B/A/S: armor reaches SS just as
                        weapons do, and the short list left an SS piece with no option to
                        match its stored rank — the select rendered blank. */}
                    <select value={armor.rank} onChange={(e) => updateArmor(armor.id, { rank: e.target.value as Armor['rank'] })} aria-label={t('sheet.rank')}>
                      {EQUIPMENT_RANKS.map((rank) => (
                        <option key={rank} value={rank}>
                          {rank}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <PrintableField
                      value={armor.notes ?? ''}
                      onChange={(e) => updateArmor(armor.id, { notes: e.target.value })}
                      aria-label={t('sheet.itemNote')}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeArmor(armor.id)}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`${styles.rowActions} ${styles.controlRow}`}>
          <label htmlFor="add-armor-catalog">{t('sheet.armorFromCatalog')}</label>
          <select id="add-armor-catalog" value={armorPick} onChange={(e) => setArmorPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {(['nonmetallic', 'metal'] as const).map((kind) => (
              <optgroup key={kind} label={t(`sheet.armorKind.${kind}`)}>
                {ARMORS.filter((definition) => definition.kind === kind).map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.name} ({definition.rank}) — {t('sheet.defense')} {definition.defense}, {definition.price.toLocaleString('ru-RU')} G
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addArmorFromCatalog} disabled={!armorPick} aria-label={t('sheet.addArmorFromCatalog')}>
            {t('sheet.addFromCatalog')}
          </button>
          <button type="button" onClick={addArmor}>
            {t('sheet.addArmor')}
          </button>
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={character.equipment.shield === null || undefined}>
        <h4 className={styles.subHead}>{t('sheet.shield')}</h4>
        {character.equipment.shield ? (
          <div className={styles.inlineRow}>
            <input value={character.equipment.shield.name} onChange={(e) => setShield({ name: e.target.value })} aria-label={t('sheet.name')} />
            <label className={styles.field}>
              <span>{t('sheet.minStr')}</span>
              <input
                type="number"
                value={character.equipment.shield.minStr}
                onChange={(e) => setShield({ minStr: Number(e.target.value) })}
                aria-label={t('sheet.minStr')}
                className={meetsStrength(strTotal, character.equipment.shield.minStr) ? undefined : styles.unmet}
              />
            </label>
            {strengthWarning(character.equipment.shield.minStr, false)}
            <label className={styles.field}>
              <span>{t('sheet.defense')}</span>
              <input
                type="number"
                value={character.equipment.shield.defenseBonus}
                onChange={(e) => setShield({ defenseBonus: Number(e.target.value) })}
                aria-label={t('sheet.defense')}
              />
            </label>
            <label className={styles.field}>
              <span>{t('sheet.evasionModifier')}</span>
              <input
                type="number"
                value={character.equipment.shield.evasionBonus}
                onChange={(e) => setShield({ evasionBonus: Number(e.target.value) })}
                aria-label={t('sheet.evasionModifier')}
              />
            </label>
            <label className={styles.field}>
              <span>{t('sheet.rank')}</span>
              <select
                value={character.equipment.shield.rank}
                onChange={(e) => setShield({ rank: e.target.value as Shield['rank'] })}
                aria-label={t('sheet.rank')}
              >
                {EQUIPMENT_RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </label>
            <PrintableField
              value={character.equipment.shield.notes}
              onChange={(e) => setShield({ notes: e.target.value })}
              aria-label={t('sheet.itemNote')}
            />
            <button type="button" onClick={() => setShield(null)}>
              {t('sheet.remove')}
            </button>
          </div>
        ) : (
          <div className={`${styles.rowActions} ${styles.controlRow}`}>
            <label htmlFor="add-shield-catalog">{t('sheet.shieldFromCatalog')}</label>
            <select id="add-shield-catalog" value={shieldPick} onChange={(e) => setShieldPick(e.target.value)}>
              <option value="">{t('creation.selectPlaceholder')}</option>
              {SHIELDS.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.name} ({definition.rank}) — {t('sheet.defense')} {definition.defense}, {definition.price.toLocaleString('ru-RU')} G
                  {definition.mountProtection ? ` · ${t('sheet.mountProtection')}` : ''}
                </option>
              ))}
            </select>
            <button type="button" onClick={addShieldFromCatalog} disabled={!shieldPick} aria-label={t('sheet.addShieldFromCatalog')}>
              {t('sheet.addFromCatalog')}
            </button>
            <button type="button" onClick={() => setShield(newShield())}>
              {t('sheet.addShield')}
            </button>
          </div>
        )}
      </div>

      <div className={styles.subsection} data-print-empty={character.equipment.accessories.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.accessories')}</h4>
        {character.equipment.accessories.length === 0 && <p className={styles.empty}>{t('sheet.noAccessories')}</p>}
        <ul className={styles.inlineList}>
          {character.equipment.accessories.map((accessory) => (
            <li key={accessory.id} className={styles.inlineRow}>
              <input value={accessory.name} onChange={(e) => updateAccessory(accessory.id, { name: e.target.value })} aria-label={t('sheet.name')} />
              <button type="button" onClick={() => removeAccessory(accessory.id)}>
                {t('sheet.remove')}
              </button>
            </li>
          ))}
        </ul>
        <div className={styles.rowActions}>
          <button type="button" onClick={addAccessory}>
            {t('sheet.addAccessory')}
          </button>
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={abyssRows.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.abyssEnhancement')}</h4>
        {abyssRows.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.abyssItem')}</th>
                  <th>{t('sheet.abyssType')}</th>
                  <th>{t('sheet.itemNote')}</th>
                  <th>{t('sheet.abyssCurse')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {abyssRows.map(({ holder, enhancement }) => (
                  <tr key={enhancement.id}>
                    {/* Plain text, not an input: the name belongs to the item's own row, and
                        text wraps on paper where an input would clip it. */}
                    <td>{holder.name || t('sheet.unnamedItem')}</td>
                    <td>
                      <select
                        value={enhancement.type}
                        onChange={(e) => updateEnhancement(holder.id, enhancement.id, { type: e.target.value })}
                        aria-label={t('sheet.abyssType')}
                      >
                        <option value=""></option>
                        {enhancementsFor(holder.target).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <PrintableField
                        value={enhancement.notes}
                        onChange={(e) => updateEnhancement(holder.id, enhancement.id, { notes: e.target.value })}
                        aria-label={t('sheet.itemNote')}
                      />
                    </td>
                    <td>
                      {/* One select for both fields: the roll indexes the book's 6×6 table
                          and the name is stored alongside so the sheet prints it. */}
                      <select
                        value={enhancement.curseRoll}
                        onChange={(e) =>
                          updateEnhancement(holder.id, enhancement.id, {
                            curseRoll: e.target.value,
                            curseName: getAbyssCurse(e.target.value)?.name ?? '',
                          })
                        }
                        aria-label={t('sheet.abyssCurse')}
                      >
                        <option value=""></option>
                        {ABYSS_CURSES.map((curse) => (
                          <option key={curse.roll} value={curse.roll}>
                            {curse.roll} — {curse.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" onClick={() => removeEnhancement(holder.id, enhancement.id)}>
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
          {holders.length === 0 ? (
            <p className={styles.empty}>{t('sheet.abyssNoEquipment')}</p>
          ) : (
            <>
              <label htmlFor="abyss-target">{t('sheet.abyssItem')}</label>
              <select id="abyss-target" value={activeAbyssTarget?.id ?? ''} onChange={(e) => setAbyssTargetId(e.target.value)}>
                {enhanceable.map((holder) => (
                  <option key={holder.id} value={holder.id}>
                    {holder.name || t('sheet.unnamedItem')}
                  </option>
                ))}
              </select>
              {/* The book allows two per item and no more; past that only the curses can be re-rolled. */}
              <button type="button" onClick={addEnhancement} disabled={!activeAbyssTarget}>
                {t('sheet.addAbyss')}
              </button>
              {enhanceable.length === 0 && <p className={styles.empty}>{t('sheet.abyssAllFull')}</p>}
            </>
          )}
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={inventoryEmpty || undefined}>
        <h4 className={styles.subHead}>{t('sheet.inventory')}</h4>

        <label className={styles.noteField}>
          <span>{t('sheet.adventurersSet')}</span>
          <input
            value={inventory.adventurersSet}
            onChange={(e) => setInventory({ adventurersSet: e.target.value })}
            placeholder={t('sheet.adventurersSetHint')}
            aria-label={t('sheet.adventurersSet')}
          />
        </label>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.quantity')}</th>
                <th>{t('sheet.weight')}</th>
                <th>{t('sheet.itemNote')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inventory.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* The rules name a handful of consumables outright; everything else is
                        hand-typed, so this suggests rather than constrains. */}
                    <PrintableField
                      list={CONSUMABLES_LIST_ID}
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      aria-label={t('sheet.name')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                      aria-label={t('sheet.quantity')}
                    />
                  </td>
                  <td>
                    <PrintableField value={item.weight} onChange={(e) => updateItem(item.id, { weight: e.target.value })} aria-label={t('sheet.weight')} />
                  </td>
                  <td>
                    <PrintableField value={item.notes} onChange={(e) => updateItem(item.id, { notes: e.target.value })} aria-label={t('sheet.itemNote')} />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeItem(item.id)}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Consumables the rules name outright, plus the Core III general equipment,
            potions, tools and accessories — suggestions for a free-text field, not a
            closed list. */}
        <datalist id={CONSUMABLES_LIST_ID}>
          {[...CONSUMABLE_PRESETS, ...GENERAL_ITEM_NAMES].map((preset) => (
            <option key={preset} value={preset} />
          ))}
        </datalist>
        <div className={styles.rowActions}>
          <button type="button" onClick={addItem}>
            {t('sheet.addItem')}
          </button>
        </div>

        <div className={styles.money}>
          <label className={styles.moneyField}>
            <span>{t('sheet.ammoType')}</span>
            <input value={inventory.ammoType} onChange={(e) => setInventory({ ammoType: e.target.value })} aria-label={t('sheet.ammoType')} />
          </label>
          <label className={styles.moneyField}>
            <span>{t('sheet.ammoCount')}</span>
            <input
              type="number"
              min={0}
              value={inventory.ammoCount}
              onChange={(e) => setInventory({ ammoCount: Number(e.target.value) })}
              aria-label={t('sheet.ammoCount')}
            />
          </label>
        </div>
      </div>

      <h4 className={styles.subHead}>{t('sheet.currency')}</h4>
      <div className={styles.money}>
        <label className={styles.moneyField}>
          <span>{t('sheet.cash')}</span>
          <input type="number" value={character.currency.cash} onChange={(e) => setCurrency('cash', Number(e.target.value))} aria-label={t('sheet.cash')} />
        </label>
        <label className={styles.moneyField}>
          <span>{t('sheet.savings')}</span>
          <input type="number" value={character.currency.savings} onChange={(e) => setCurrency('savings', Number(e.target.value))} aria-label={t('sheet.savings')} />
        </label>
        <label className={styles.moneyField}>
          <span>{t('sheet.debt')}</span>
          <input type="number" value={character.currency.debt} onChange={(e) => setCurrency('debt', Number(e.target.value))} aria-label={t('sheet.debt')} />
        </label>
      </div>

      <div className={styles.subsection} data-print-empty={character.currency.spendingLog === '' || undefined}>
        <label className={styles.noteField}>
          <span>{t('sheet.spendingLog')}</span>
          <textarea
            value={character.currency.spendingLog}
            onChange={(e) => {
              setSpendingLog(e.target.value);
              autoGrow(e.target);
            }}
            ref={autoGrow}
            rows={2}
            placeholder={t('sheet.spendingLogHint')}
            aria-label={t('sheet.spendingLog')}
          />
        </label>
      </div>
    </section>
  );
}
