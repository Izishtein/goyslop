import { useTranslation } from 'react-i18next';
import { EQUIPMENT_RANKS, type Accessory, type Armor, type Character, type Shield, type Weapon } from '../../types/character';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { evasion as baseEvasionFormula } from '../../lib/formulas/derived-stats';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { totalDefense, totalEvasion, weaponTotalAccuracy, weaponTotalExtraDamage } from '../../lib/formulas/weapon-stats';
import { getClass } from '../../data/classes';
import { useUpdateCharacter } from '../../state/characters';
import styles from './CharacterSheetView.module.css';

function primaryWarriorLevel(character: Character): number {
  return character.classes
    .filter((classLevel) => getClass(classLevel.classId)?.type === 'warrior')
    .reduce((max, classLevel) => Math.max(max, classLevel.level), 0);
}

function newWeapon(): Weapon {
  return { id: crypto.randomUUID(), name: '', stance: '1H', minStr: 0, accuracyBonus: 0, power: 1, criticalValue: 10, extraDamageBonus: 0, rank: 'B' };
}

function newArmor(): Armor {
  return { id: crypto.randomUUID(), name: '', defense: 0, evasionModifier: 0, minStr: 0, rank: 'B' };
}

function newAccessory(): Accessory {
  return { id: crypto.randomUUID(), name: '' };
}

export function EquipmentSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

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
  function removeWeapon(id: string) {
    update((c) => ({ ...c, equipment: { ...c.equipment, weapons: c.equipment.weapons.filter((w) => w.id !== id) } }));
  }

  function updateArmor(id: string, patch: Partial<Armor>) {
    update((c) => ({ ...c, equipment: { ...c.equipment, armor: c.equipment.armor.map((a) => (a.id === id ? { ...a, ...patch } : a)) } }));
  }
  function addArmor() {
    update((c) => ({ ...c, equipment: { ...c.equipment, armor: [...c.equipment.armor, newArmor()] } }));
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
        shield: patch === null ? null : { ...(c.equipment.shield ?? { id: crypto.randomUUID(), name: '', defenseBonus: 0, evasionBonus: 0, minStr: 0 }), ...patch },
      },
    }));
  }

  function setCurrency(field: keyof Character['currency'], value: number) {
    update((c) => ({ ...c, currency: { ...c.currency, [field]: value } }));
  }

  return (
    <section>
      <h3>{t('sheet.equipment')}</h3>
      <p>
        {t('sheet.totalDefense')}: {defense} · {t('sheet.totalEvasion')}: {evasionTotal}
      </p>

      <h4>{t('sheet.weapons')}</h4>
      <table className={styles.abilityTable}>
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.equipment.weapons.map((weapon) => (
            <tr key={weapon.id}>
              <td>
                <input value={weapon.name} onChange={(e) => updateWeapon(weapon.id, { name: e.target.value })} aria-label={t('sheet.name')} />
              </td>
              <td>
                <select value={weapon.stance} onChange={(e) => updateWeapon(weapon.id, { stance: e.target.value as Weapon['stance'] })} aria-label={t('sheet.stance')}>
                  <option value="1H">1H</option>
                  <option value="2H">2H</option>
                  <option value="special">{t('sheet.special')}</option>
                </select>
              </td>
              <td>
                <input type="number" value={weapon.minStr} onChange={(e) => updateWeapon(weapon.id, { minStr: Number(e.target.value) })} aria-label={t('sheet.minStr')} />
              </td>
              <td>
                <input
                  type="number"
                  value={weapon.accuracyBonus}
                  onChange={(e) => updateWeapon(weapon.id, { accuracyBonus: Number(e.target.value) })}
                  aria-label={t('sheet.accuracyBonus')}
                />
              </td>
              <td>{weaponTotalAccuracy(warriorLevel, dexMod, weapon.accuracyBonus)}</td>
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
              <td>{weaponTotalExtraDamage(warriorLevel, strMod, weapon.extraDamageBonus)}</td>
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
                <button type="button" onClick={() => removeWeapon(weapon.id)}>
                  {t('sheet.remove')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={addWeapon}>
        {t('sheet.addWeapon')}
      </button>

      <h4>{t('sheet.armor')}</h4>
      <table className={styles.abilityTable}>
        <thead>
          <tr>
            <th>{t('sheet.name')}</th>
            <th>{t('sheet.defense')}</th>
            <th>{t('sheet.evasionModifier')}</th>
            <th>{t('sheet.minStr')}</th>
            <th>{t('sheet.rank')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.equipment.armor.map((armor) => (
            <tr key={armor.id}>
              <td>
                <input value={armor.name} onChange={(e) => updateArmor(armor.id, { name: e.target.value })} aria-label={t('sheet.name')} />
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
              <td>
                <input type="number" value={armor.minStr} onChange={(e) => updateArmor(armor.id, { minStr: Number(e.target.value) })} aria-label={t('sheet.minStr')} />
              </td>
              <td>
                <select value={armor.rank} onChange={(e) => updateArmor(armor.id, { rank: e.target.value as Armor['rank'] })} aria-label={t('sheet.rank')}>
                  {(['B', 'A', 'S'] as const).map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
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
      <button type="button" onClick={addArmor}>
        {t('sheet.addArmor')}
      </button>

      <h4>{t('sheet.shield')}</h4>
      {character.equipment.shield ? (
        <p>
          <input value={character.equipment.shield.name} onChange={(e) => setShield({ name: e.target.value })} aria-label={t('sheet.name')} />{' '}
          <input
            type="number"
            value={character.equipment.shield.defenseBonus}
            onChange={(e) => setShield({ defenseBonus: Number(e.target.value) })}
            aria-label={t('sheet.defense')}
          />{' '}
          <input
            type="number"
            value={character.equipment.shield.evasionBonus}
            onChange={(e) => setShield({ evasionBonus: Number(e.target.value) })}
            aria-label={t('sheet.evasionModifier')}
          />{' '}
          <button type="button" onClick={() => setShield(null)}>
            {t('sheet.remove')}
          </button>
        </p>
      ) : (
        <button type="button" onClick={() => setShield({ name: '', defenseBonus: 0, evasionBonus: 0, minStr: 0 })}>
          {t('sheet.addShield')}
        </button>
      )}

      <h4>{t('sheet.accessories')}</h4>
      <ul className={styles.classList}>
        {character.equipment.accessories.map((accessory) => (
          <li key={accessory.id}>
            <input value={accessory.name} onChange={(e) => updateAccessory(accessory.id, { name: e.target.value })} aria-label={t('sheet.name')} />
            <button type="button" onClick={() => removeAccessory(accessory.id)}>
              {t('sheet.remove')}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addAccessory}>
        {t('sheet.addAccessory')}
      </button>

      <h4>{t('sheet.currency')}</h4>
      <p>
        {t('sheet.cash')} <input type="number" value={character.currency.cash} onChange={(e) => setCurrency('cash', Number(e.target.value))} aria-label={t('sheet.cash')} /> G ·{' '}
        {t('sheet.savings')} <input type="number" value={character.currency.savings} onChange={(e) => setCurrency('savings', Number(e.target.value))} aria-label={t('sheet.savings')} /> G ·{' '}
        {t('sheet.debt')} <input type="number" value={character.currency.debt} onChange={(e) => setCurrency('debt', Number(e.target.value))} aria-label={t('sheet.debt')} /> G
      </p>
    </section>
  );
}
