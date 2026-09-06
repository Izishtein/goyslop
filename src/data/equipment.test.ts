import { describe, expect, it } from 'vitest';
import {
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
    for (const entry of WEAPONS) byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
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
    expect(WEAPONS).toHaveLength(63);
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
      potion: 3,
      repair: 3,
      classItem: 7,
      adventure: 5,
      accessory: 19,
      ammunition: 2,
    });
    expect(GENERAL_ITEMS).toHaveLength(45);
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
    const unpriced = WEAPONS.filter((entry) => entry.price === undefined);
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
