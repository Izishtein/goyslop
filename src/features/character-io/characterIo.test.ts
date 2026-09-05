import { describe, expect, it } from 'vitest';
import { characterFileName, characterToJson, parseImportedCharacter } from './characterIo';
import type { Character } from '../../types/character';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Test Hero',
    raceId: 'human',
    background: 'Artificer',
    abilities: {
      DEX: { base: 8, correction: 0, growth: 0, itemBonus: 0 },
      AGI: { base: 8, correction: 0, growth: 0, itemBonus: 0 },
      STR: { base: 4, correction: 0, growth: 0, itemBonus: 0 },
      VIT: { base: 4, correction: 0, growth: 0, itemBonus: 0 },
      INT: { base: 9, correction: 0, growth: 0, itemBonus: 0 },
      SPR: { base: 9, correction: 0, growth: 0, itemBonus: 0 },
    },
    classes: [{ classId: 'artificer', level: 1 }],
    hp: { current: 7 },
    mp: { current: 12 },
    statusEffects: [],
    equipment: { weapons: [], armor: [], shield: null, accessories: [] },
    currency: { cash: 1200, savings: 0, debt: 0 },
    combatFeats: [],
    experience: { total: 0, spent: 0 },
    spells: [],
    growthLog: [],
    reputation: 0,
    ...overrides,
  };
}

describe('characterFileName', () => {
  it('slugifies the character name', () => {
    expect(characterFileName(makeCharacter({ name: 'Sir Growls-A-Lot!' }))).toBe('Sir_Growls-A-Lot_.sw25.json');
  });

  it('falls back to "character" for an empty/whitespace name', () => {
    expect(characterFileName(makeCharacter({ name: '   ' }))).toBe('character.sw25.json');
  });
});

describe('characterToJson + parseImportedCharacter round-trip', () => {
  it('re-parses an exported character back to an equal object', () => {
    const character = makeCharacter();
    const result = parseImportedCharacter(characterToJson(character));
    expect(result).toEqual({ success: true, character });
  });

  it('backfills equipment/currency/combatFeats when importing an old-shaped export', () => {
    const character = makeCharacter();
    const { equipment: _equipment, currency: _currency, combatFeats: _combatFeats, ...legacyShape } = character;
    const result = parseImportedCharacter(JSON.stringify(legacyShape));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.character.equipment).toEqual({ weapons: [], armor: [], shield: null, accessories: [] });
    }
  });
});

describe('parseImportedCharacter error handling', () => {
  it('reports invalidJson for unparseable text', () => {
    expect(parseImportedCharacter('not json{')).toEqual({ success: false, error: 'invalidJson' });
  });

  it('reports invalidCharacter for well-formed JSON that fails the schema', () => {
    expect(parseImportedCharacter(JSON.stringify({ hello: 'world' }))).toEqual({ success: false, error: 'invalidCharacter' });
  });
});
