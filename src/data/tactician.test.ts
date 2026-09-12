import { describe, expect, it } from 'vitest';
import {
  getManeuver,
  getStratagem,
  listManeuversByLevel,
  listStratagemsByLevel,
  MANEUVERS,
  STRATAGEMS,
} from './tactician';

describe('stratagem catalog', () => {
  it('holds 35, not the 33 the Russian digest lists (Magus Arts pp. 36-39)', () => {
    expect(STRATAGEMS).toHaveLength(35);
    expect(listStratagemsByLevel(1)).toHaveLength(12);
    expect(listStratagemsByLevel(5)).toHaveLength(14);
    expect(listStratagemsByLevel(10)).toHaveLength(9);
  });

  it('has unique ids', () => {
    expect(new Set(STRATAGEMS.map((s) => s.id)).size).toBe(STRATAGEMS.length);
  });

  it('includes the two entries the Russian digest omits entirely', () => {
    expect(getStratagem('ironclad-defense-i')).toMatchObject({ rank: 1, requiredLevel: 1, type: 'defense' });
    expect(getStratagem('surging-offense-v-hellfire')).toMatchObject({ rank: 5, requiredLevel: 10, edgeCost: 5 });
  });

  it('gives every Rank 5 Stratagem an Edge cost and no accumulation', () => {
    for (const s of STRATAGEMS.filter((s) => s.rank === 5)) {
      expect(s.edgeCost).toBeGreaterThan(0);
      expect(s.edgeAccumulation).toBe(0);
    }
  });
});

describe('maneuver catalog', () => {
  it('holds 15 — the book prints no Maneuvers past 5th level', () => {
    expect(MANEUVERS).toHaveLength(15);
    expect(listManeuversByLevel(1)).toHaveLength(7);
    expect(listManeuversByLevel(5)).toHaveLength(8);
  });

  it('has unique ids', () => {
    expect(new Set(MANEUVERS.map((m) => m.id)).size).toBe(MANEUVERS.length);
  });

  it('points every prerequisite at a Maneuver that actually exists in the catalog', () => {
    const names = new Set(MANEUVERS.map((m) => m.name));
    for (const m of MANEUVERS) {
      if (m.prerequisite) expect(names).toContain(m.prerequisite);
    }
  });

  it('looks a maneuver up by id and carries its condition text where the book prints one', () => {
    expect(getManeuver('strategic-ingenuity')).toMatchObject({ condition: 'When making an Initiative check' });
    expect(getManeuver('sweeping-victory')?.condition).toContain('0 HP');
    expect(getManeuver('careful-guard-ii')).toMatchObject({ prerequisite: 'Careful Guard I', edgeCost: 5 });
  });
});
