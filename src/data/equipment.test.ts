import { describe, expect, it } from 'vitest';
import {
  BARBAROUS_ENHANCEMENT_PRICES,
  ARMORS,
  GENERAL_ITEMS,
  GENERAL_ITEM_CATEGORIES,
  SHIELDS,
  WEAPONS,
  WEAPON_CATEGORIES,
  getArmor,
  getShield,
  getWeapon,
  listWeaponsByCategory,
} from './equipment';

describe('Core III equipment catalog', () => {
  it('holds every weapon the book prints, by category', () => {
    const byCategory: Record<string, number> = {};
    for (const entry of WEAPONS.filter((weapon) => weapon.sourceBook === 'Core Rulebook III')) byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
    // Core III pp. 207-217. Eclair, Rimahawk and Eversio appear twice in the book — once in
    // their melee category, once in the SS thrown table — and are counted once here, under
    // the melee category, which is why "thrown" holds only the three that are thrown-only.
    expect(byCategory).toEqual({
      sword: 7,
      axe: 6,
      spear: 6,
      mace: 5,
      staff: 3,
      flail: 5,
      warhammer: 6,
      wrestling: 6,
      thrown: 3,
      bow: 6,
      crossbow: 5,
      gun: 5,
    });
    expect(WEAPONS.filter((weapon) => weapon.sourceBook === 'Core Rulebook III')).toHaveLength(63);
  });

  it('prices the Barbarous Rage enhancements by rank, doubling from B to S and again to SS where the book does', () => {
    expect(BARBAROUS_ENHANCEMENT_PRICES.soulscarProcessing).toEqual({ B: 3000, A: 6000, S: 12000, SS: 24000 });
    expect(BARBAROUS_ENHANCEMENT_PRICES.denudation).toEqual({ B: 1000, A: 2000, S: 4000, SS: 8000 });
    expect(BARBAROUS_ENHANCEMENT_PRICES.magicWeaponPlus2).toEqual({ B: 20000, A: 40000, S: 80000, SS: 160000 });
  });

  it("adds the Barbarous Rage innate weapons: the Centaur's Hoof and the Dawn's three ranks of claws", () => {
    const extra = WEAPONS.filter((weapon) => weapon.sourceBook === 'Barbarous Rage');
    expect(extra.map((weapon) => weapon.name)).toEqual(['Hoof', 'Claws (Dawn)', 'Talons (Dawn)', 'Piercing Claws (Dawn)']);
    expect(extra.every((weapon) => weapon.category === 'wrestling' && weapon.price === undefined)).toBe(true);
    // table p. 64 plus the [Assassination Skills] bonuses of p. 44: Accuracy +1 / +1 / +3, Extra Damage +2 / +3 / +4
    expect(extra.slice(1).map((weapon) => [weapon.rows[0].accuracy, weapon.rows[0].power, weapon.rows[0].extraDamage])).toEqual([
      [1, 6, 2],
      [1, 16, 3],
      [3, 21, 4],
    ]);
  });

  it('holds every armor and shield the book prints', () => {
    // p. 218 nonmetallic (9), p. 219 metal (7), p. 220 shields (9).
    expect(ARMORS.filter((entry) => entry.kind === 'nonmetallic')).toHaveLength(9);
    expect(ARMORS.filter((entry) => entry.kind === 'metal')).toHaveLength(7);
    expect(SHIELDS).toHaveLength(9);
  });

  it('holds the general equipment of pp. 217-225', () => {
    const byCategory: Record<string, number> = {};
    for (const entry of GENERAL_ITEMS) byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
    expect(byCategory).toEqual({
      clothing: 1,
      travel: 5,
      // +3 Barbarous Rage (pp. 70): Tinted Potion, Jet Black Revitalizing Wine, Soulscarred Dried Meat.
      potion: 3 + 3,
      repair: 3,
      // +9 Bibliomancer grimoires (Age of Grimoire, SW 2.0 — see 17-arcane-magic.md).
      // +9 Geomancer Geographs (Magus Arts p. 22 — see 33-geomancer-aspects.md).
      // +3 Barbarous Rage: Drake's Magic Sword, Eye Of Stone, Diablo Core.
      classItem: 7 + 9 + 9 + 3,
      // +1 Sword Crystal (Barbarous Saga p. 4, Broken Drake's [Limited Dragonification] —
      // see 40-barbarous-saga-races-and-gods.md).
      // +8 Barbarous Rage (pp. 69-71): portable set, shackles and the six consumables.
      adventure: 5 + 1 + 8,
      // +6 Barbarous Rage (pp. 71-72): visor, three earrings, two collars.
      accessory: 19 + 6,
      ammunition: 2,
    });
    expect(GENERAL_ITEMS).toHaveLength(45 + 9 + 9 + 1 + 20);
  });

  it('has unique ids inside every list', () => {
    for (const list of [WEAPONS, ARMORS, SHIELDS, GENERAL_ITEMS]) {
      expect(new Set(list.map((entry) => entry.id)).size).toBe(list.length);
    }
  });

  it('files every entry under a known category', () => {
    for (const entry of WEAPONS) expect(WEAPON_CATEGORIES).toContain(entry.category);
    for (const entry of GENERAL_ITEMS) expect(GENERAL_ITEM_CATEGORIES).toContain(entry.category);
    const counted = WEAPON_CATEGORIES.reduce((sum, category) => sum + listWeaponsByCategory(category).length, 0);
    expect(counted).toBe(WEAPONS.length);
  });

  it('gives every weapon at least one stance row', () => {
    for (const entry of WEAPONS) expect(entry.rows.length).toBeGreaterThan(0);
  });

  it('prints no Power for guns and a Power for everything else', () => {
    for (const entry of WEAPONS) {
      for (const stanceRow of entry.rows) {
        if (entry.category === 'gun') expect(stanceRow.power).toBeUndefined();
        else expect(stanceRow.power).toBeGreaterThan(0);
      }
    }
    // The bullet carries a gun's Power, so the magazine size is what the table prints instead.
    for (const gun of listWeaponsByCategory('gun')) expect(gun.magazine).toBeGreaterThan(0);
  });

  it('prices everything except Bite, which is a body part', () => {
    const unpriced = WEAPONS.filter((entry) => entry.price === undefined && entry.sourceBook === 'Core Rulebook III');
    expect(unpriced.map((entry) => entry.name)).toEqual(['Bite']);
  });

  it('gives every ranged weapon a range and no melee weapon one', () => {
    for (const entry of WEAPONS) {
      const ranged = ['thrown', 'bow', 'crossbow', 'gun'].includes(entry.category) || entry.rows.some((stanceRow) => stanceRow.stance.endsWith('*'));
      expect({ name: entry.name, hasRange: Boolean(entry.range) }).toEqual({ name: entry.name, hasRange: ranged });
    }
  });

  it('marks the three shields that protect a mount', () => {
    // p. 220: a Jockey's shield with this annotation covers every section of the mount.
    expect(SHIELDS.filter((entry) => entry.mountProtection).map((entry) => entry.name)).toEqual([
      'Knight Shield',
      'Grand Partner',
      "Paladin's Pride",
    ]);
  });

  it('looks entries up by id', () => {
    expect(getWeapon('geister')).toMatchObject({ name: 'Geister', rank: 'SS', category: 'sword' });
    expect(getArmor('imperial')).toMatchObject({ name: 'Imperial', defense: 14, minStr: 30 });
    expect(getShield('knight-shield')).toMatchObject({ name: 'Knight Shield', mountProtection: true });
  });
});
