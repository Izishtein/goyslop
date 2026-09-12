import { describe, expect, it } from 'vitest';
import { characterFileName, charactersToJson, characterToJson, parseImportedCharacters, rosterFileName } from './characterIo';
import { EMPTY_INVENTORY, type Character, EMPTY_PERFORMANCE, EMPTY_FELLOW, EMPTY_GEOMANCER_QI } from '../../types/character';

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
    abyssCorruptionLevel: 0,
    equipment: { weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
    currency: { cash: 1200, savings: 0, debt: 0, spendingLog: '' },
    combatFeats: [],
    experience: { total: 0, spent: 0 },
    spells: [],
    arts: [],
    evocations: [],
    materialCards: {},
    mounts: [],
    performance: EMPTY_PERFORMANCE,
    growthLog: [],
    reputation: 0,
    profile: { gender: '', age: '', avatar: '' },
    notes: { story: '', goals: '', gm: '' },
    connections: [],
    fellow: EMPTY_FELLOW,
    workSkills: [],
    stunts: [],
    aspects: [],
    geomancerQi: EMPTY_GEOMANCER_QI,
    stratagems: [],
    maneuvers: [],
    tacticianEdge: 0,
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

describe('characterToJson + parseImportedCharacters round-trip', () => {
  it('re-parses a single exported character back to an equal object', () => {
    const character = makeCharacter();
    const result = parseImportedCharacters(characterToJson(character));
    expect(result).toEqual({ success: true, characters: [character] });
  });

  it('backfills equipment/currency/combatFeats when importing an old-shaped export', () => {
    const character = makeCharacter();
    const { equipment: _equipment, currency: _currency, combatFeats: _combatFeats, ...legacyShape } = character;
    const result = parseImportedCharacters(JSON.stringify(legacyShape));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.characters[0].equipment).toEqual({ weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY });
    }
  });
});

describe('charactersToJson + parseImportedCharacters round-trip (whole roster)', () => {
  it('re-parses an exported roster back to an equal array', () => {
    const characters = [makeCharacter({ id: 'char-1' }), makeCharacter({ id: 'char-2', name: 'Second Hero' })];
    const result = parseImportedCharacters(charactersToJson(characters));
    expect(result).toEqual({ success: true, characters });
  });

  it('keeps the entries that parse when one entry in the array is unreadable', () => {
    const good = makeCharacter();
    const result = parseImportedCharacters(JSON.stringify([good, { not: 'a character' }]));
    expect(result).toEqual({ success: true, characters: [good] });
  });
});

describe('rosterFileName', () => {
  it('names the whole-roster export distinctly from a single character export', () => {
    expect(rosterFileName()).toBe('roster.sw25.json');
  });
});

describe('parseImportedCharacters error handling', () => {
  it('reports invalidJson for unparseable text', () => {
    expect(parseImportedCharacters('not json{')).toEqual({ success: false, error: 'invalidJson' });
  });

  it('reports invalidCharacter for well-formed JSON that fails the schema', () => {
    expect(parseImportedCharacters(JSON.stringify({ hello: 'world' }))).toEqual({ success: false, error: 'invalidCharacter' });
  });

  it('reports invalidCharacter for an array with no readable entries', () => {
    expect(parseImportedCharacters(JSON.stringify([{ not: 'a character' }]))).toEqual({ success: false, error: 'invalidCharacter' });
  });
});
