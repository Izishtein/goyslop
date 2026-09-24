import { describe, expect, it } from 'vitest';
import { CharacterSchema, type Character } from '../types/character';
import { abilityPointCost } from '../lib/formulas/point-buy';
import { RACES } from './races';
import { ABILITY_IDS } from '../lib/formulas/abilities';
import { COMBAT_FEATS } from './combat-feats';
import { SPELLS } from './spells';
import { CLASSES } from './classes';

// The pregenerated quick-start characters (§ 5.2 of docs/roadmap.md) live outside src/ as
// plain .sw25.json files — the same shape the app's own import button reads — so this test
// exercises them exactly as a player importing one of these files would.
const singleFiles = import.meta.glob<Record<string, unknown>>('../../pregens/*.sw25.json', { eager: true, import: 'default' });
delete singleFiles['../../pregens/roster.sw25.json'];
const files = Object.entries(singleFiles);

const roster = Object.entries(
  import.meta.glob<Record<string, unknown>>('../../pregens/roster.sw25.json', { eager: true, import: 'default' }),
)[0][1] as unknown as Character[];

describe('pregenerated quick-start characters', () => {
  it('found seven single-character files', () => {
    expect(files.length).toBe(7);
  });

  it.each(files)('%s parses as a valid Character', (path, raw) => {
    const result = CharacterSchema.safeParse(raw);
    if (!result.success) throw new Error(`${path}: ${result.error.message}`);
  });

  it('roster.sw25.json contains the same seven characters', () => {
    expect(Array.isArray(roster)).toBe(true);
    expect(roster.length).toBe(7);
    for (const entry of roster) {
      const result = CharacterSchema.safeParse(entry);
      expect(result.success).toBe(true);
    }
  });

  it('ids are unique across the roster', () => {
    const ids = new Set(roster.map((c) => c.id));
    expect(ids.size).toBe(roster.length);
  });

  it('covers seven distinct classes', () => {
    const classIds = new Set(roster.map((c) => c.classes[0]?.classId));
    expect(classIds.size).toBe(7);
  });

  it("every weapon and shield minimum Strength is met by the character's STR", () => {
    for (const c of roster) {
      const str = c.abilities.STR;
      const strTotal = str.base + str.correction + str.growth + str.itemBonus;
      for (const w of c.equipment.weapons) {
        expect(strTotal, `${c.name} / ${w.name}`).toBeGreaterThanOrEqual(w.minStr);
      }
      if (c.equipment.shield) {
        expect(strTotal, `${c.name} / ${c.equipment.shield.name}`).toBeGreaterThanOrEqual(c.equipment.shield.minStr);
      }
    }
  });

  it('every Point Buy correction stays within its racial budget (total cost <= 0)', () => {
    for (const c of roster) {
      const race = RACES.find((r) => r.id === c.raceId);
      if (!race?.abilityDice) throw new Error(`${c.name}: race ${c.raceId} has no ability dice`);
      let totalCost = 0;
      for (const ability of ABILITY_IDS) {
        const cost = abilityPointCost(race.abilityDice[ability], c.abilities[ability].correction);
        if (cost === undefined) throw new Error(`${c.name}: ${ability} correction ${c.abilities[ability].correction} is not a legal Point Buy pick`);
        totalCost += cost;
      }
      expect(totalCost, c.name).toBeLessThanOrEqual(0);
    }
  });

  it('background grants the starting class and matches the catalog Skill/Body/Mind split', () => {
    const baseSource: Record<string, 'skill' | 'body' | 'mind'> = {
      DEX: 'skill', AGI: 'skill', STR: 'body', VIT: 'body', INT: 'mind', SPR: 'mind',
    };
    for (const c of roster) {
      const race = RACES.find((r) => r.id === c.raceId);
      const tables = race?.backgroundTables;
      if (!tables) throw new Error(`${c.name}: race ${c.raceId} has no background tables`);
      const allRows = [...tables.primary, ...(tables.additional ?? []), ...(tables.supplemental ?? [])];
      const row = allRows.find((r) => r.name === c.background);
      if (!row) throw new Error(`${c.name}: no background "${c.background}" on race ${c.raceId}`);
      const classId = c.classes[0].classId;
      expect(row.startingClasses?.classIds, `${c.name} background classes`).toContain(classId);
      if (!row.stats) throw new Error(`${c.name}: background "${c.background}" rolls its own stats`);
      const [skill, body, mind] = row.stats;
      for (const ability of ABILITY_IDS) {
        const expected = { skill, body, mind }[baseSource[ability]];
        expect(c.abilities[ability].base, `${c.name} ${ability} base`).toBe(expected);
      }
    }
  });

  it('combat feats exist in the catalog with the recorded id and category', () => {
    for (const c of roster) {
      for (const f of c.combatFeats) {
        const def = COMBAT_FEATS.find((d) => d.id === f.id);
        expect(def, `${c.name} / ${f.name}`).toBeDefined();
        expect(def?.name).toBe(f.name);
        expect(def?.category).toBe(f.category);
      }
    }
  });

  it("known spells match the catalog school/circle/mp for the character's magic school", () => {
    for (const c of roster) {
      if (c.spells.length === 0) continue;
      const cls = CLASSES.find((k) => k.id === c.classes[0].classId);
      expect(cls?.magicSchool, `${c.name} class ${c.classes[0].classId}`).toBeDefined();
      for (const s of c.spells) {
        expect(s.school, `${c.name} / ${s.name}`).toBe(cls!.magicSchool);
        const def = SPELLS.find((d) => d.name === s.name && d.school === s.school);
        expect(def, `${c.name} / ${s.name}`).toBeDefined();
        expect(def?.circle).toBe(s.circle);
        expect(def?.mp).toBe(s.mp);
      }
    }
  });
});
