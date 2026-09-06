import { describe, expect, it } from 'vitest';
import {
  MOUNTS,
  MOUNT_CATEGORIES,
  MOUNT_GEAR,
  MOUNT_GEAR_KINDS,
  MOUNT_VARIANTS,
  getMount,
  listMountGear,
  listMountsByCategory,
  mountLevelFor,
  rowsAtLevel,
} from './mounts';

describe('mount catalog', () => {
  it('holds every mount the book gives a data block', () => {
    const byCategory: Record<string, number> = {};
    for (const mount of MOUNTS) byCategory[mount.category] = (byCategory[mount.category] ?? 0) + 1;
    // pp. 254-257 animals (8), pp. 257-260 mythical beasts (5), pp. 261-262 magitech (4).
    expect(byCategory).toEqual({ animal: 8, mythicalBeast: 5, magitech: 4 });
    expect(MOUNTS).toHaveLength(17);
    // The "+5 movement, purchase only" mounts of pp. 247-248 have no data block of their own.
    expect(MOUNT_VARIANTS).toHaveLength(7);
  });

  it('has unique ids across mounts, variants and gear', () => {
    for (const list of [MOUNTS, MOUNT_VARIANTS, MOUNT_GEAR]) {
      expect(new Set(list.map((entry) => entry.id)).size).toBe(list.length);
    }
  });

  it('points every variant at a mount that exists', () => {
    for (const entry of MOUNT_VARIANTS) expect(getMount(entry.variantOf)).toBeDefined();
  });

  it('files every mount and every piece of gear under a known category', () => {
    for (const mount of MOUNTS) expect(MOUNT_CATEGORIES).toContain(mount.category);
    const counted = MOUNT_CATEGORIES.reduce((sum, category) => sum + listMountsByCategory(category).length, 0);
    expect(counted).toBe(MOUNTS.length);
    const gearCounted = MOUNT_GEAR_KINDS.reduce((sum, kind) => sum + listMountGear(kind).length, 0);
    expect(gearCounted).toBe(MOUNT_GEAR.length);
  });

  it('covers exactly the Appropriate Level range, every level once per section', () => {
    for (const mount of MOUNTS) {
      const [min, max] = mount.appropriateLevel;
      const sectionCount = mount.sections?.names.length ?? 1;
      const levels = [...new Set(mount.levels.map((row) => row.level))].sort((a, b) => a - b);
      expect({ name: mount.name, levels }).toEqual({
        name: mount.name,
        levels: Array.from({ length: max - min + 1 }, (_, index) => min + index),
      });
      for (const level of levels) {
        expect({ name: mount.name, level, rows: rowsAtLevel(mount, level).length }).toEqual({ name: mount.name, level, rows: sectionCount });
      }
    }
  });

  it('gives resistances to the main section only on a multi-section mount', () => {
    for (const mount of MOUNTS) {
      for (const row of mount.levels) {
        // The book rolls one resistance check for the whole creature, so it prints Fortitude
        // and Willpower against the main section and dashes the rest.
        const isMain = mount.sections === undefined || row.section === mount.sections.main;
        expect({ mount: mount.name, section: row.section, hasFort: row.fortitude !== undefined }).toEqual({
          mount: mount.name,
          section: row.section,
          hasFort: isMain,
        });
      }
    }
  });

  it('leaves magitech mounts without MP and gives every other mount some', () => {
    for (const mount of MOUNTS) {
      for (const row of mount.levels) {
        if (mount.category === 'magitech') expect(row.mp).toBeUndefined();
        else expect(row.mp).toBeGreaterThan(0);
      }
    }
  });

  it('prints a regeneration price only where the mount has sections to lose', () => {
    const withPrice = MOUNTS.filter((mount) => mount.regenerationPrice !== undefined).map((mount) => mount.name);
    expect(withPrice).toEqual(['Tilgris', 'Draconet', 'Lesser Dragon']);
    for (const mount of MOUNTS) {
      expect({ name: mount.name, sectioned: mount.sections !== undefined }).toEqual({
        name: mount.name,
        sectioned: mount.regenerationPrice !== undefined,
      });
    }
  });

  it('clamps the mount level to the Appropriate Level range', () => {
    const horse = getMount('horse');
    const dragon = getMount('lesser-dragon');
    if (!horse || !dragon) throw new Error('catalog entry missing');
    // A Horse does not grow with its rider past level 4 — that cap is the whole reason a
    // Jockey buys a bigger mount.
    expect(mountLevelFor(horse, 15)).toBe(4);
    expect(mountLevelFor(horse, 2)).toBe(2);
    // Below the minimum the mount cannot be handled at all; the row shown is the lowest one.
    expect(mountLevelFor(dragon, 1)).toBe(13);
    expect(mountLevelFor(dragon, 14)).toBe(14);
  });

  it('reads the sections of a multi-section mount at one level', () => {
    const tilgris = getMount('tilgris');
    if (!tilgris) throw new Error('catalog entry missing');
    expect(rowsAtLevel(tilgris, 10).map((row) => ({ section: row.section, hp: row.hp, damage: row.damage }))).toEqual([
      { section: 'Front', hp: 83, damage: '2d+11' },
      { section: 'Back', hp: 93, damage: '2d+14' },
    ]);
  });

  it('splits mount gear the way the book does', () => {
    // p. 250 weapons and armor, pp. 248-249 carry items, p. 249 regeneration items.
    expect(listMountGear('weapon')).toHaveLength(9);
    expect(listMountGear('armor')).toHaveLength(8);
    expect(listMountGear('carry')).toHaveLength(8);
    expect(listMountGear('regeneration')).toHaveLength(2);
    // Armaments "for proprietary mounts only" cannot go on a rented mount.
    expect(MOUNT_GEAR.filter((entry) => entry.proprietaryOnly).map((entry) => entry.name)).toEqual([
      'Flicker Star',
      'Metal Horn',
      'Manatite Horn',
    ]);
  });
});
