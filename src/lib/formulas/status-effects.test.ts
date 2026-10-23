import { describe, expect, it } from 'vitest';
import type { StatusEffect } from '../../types/character';
import { skillCheckModifier, sumModifiersForField, tickStatusEffects } from './status-effects';

function makeEffect(overrides: Partial<StatusEffect> = {}): StatusEffect {
  return {
    id: 'effect-1',
    name: 'Poison',
    duration: { kind: 'rounds', remaining: 2 },
    modifiers: [{ field: 'fortitude', value: -2 }],
    ...overrides,
  };
}

describe('tickStatusEffects', () => {
  it('decrements round-based durations by one', () => {
    const [effect] = tickStatusEffects([makeEffect()]);
    expect(effect.duration).toEqual({ kind: 'rounds', remaining: 1 });
  });

  it('drops effects whose rounds reach zero', () => {
    const result = tickStatusEffects([makeEffect({ duration: { kind: 'rounds', remaining: 1 } })]);
    expect(result).toHaveLength(0);
  });

  it('leaves permanent and untilRemoved effects untouched', () => {
    const permanent = makeEffect({ id: 'p', duration: { kind: 'permanent' } });
    const untilRemoved = makeEffect({ id: 'u', duration: { kind: 'untilRemoved' } });
    const result = tickStatusEffects([permanent, untilRemoved]);
    expect(result).toEqual([permanent, untilRemoved]);
  });
});

describe('sumModifiersForField', () => {
  it('sums modifiers across multiple effects targeting the same field', () => {
    const effects = [
      makeEffect({ id: 'a', modifiers: [{ field: 'accuracy', value: -1 }] }),
      makeEffect({ id: 'b', modifiers: [{ field: 'accuracy', value: -3 }] }),
    ];
    expect(sumModifiersForField(effects, 'accuracy')).toBe(-4);
  });

  it('returns 0 when no effect targets the field', () => {
    expect(sumModifiersForField([makeEffect()], 'evasion')).toBe(0);
  });
});

describe('skillCheckModifier', () => {
  const effect = (id: string, modifiers: StatusEffect['modifiers']): StatusEffect => ({ id, name: id, duration: { kind: 'untilRemoved' }, modifiers });

  it('sums the skillChecks rows and ignores other fields', () => {
    expect(skillCheckModifier([effect('a', [{ field: 'skillChecks', value: -2 }, { field: 'accuracy', value: 5 }]), effect('b', [{ field: 'skillChecks', value: 1 }])])).toBe(-1);
    expect(skillCheckModifier([])).toBe(0);
    expect(skillCheckModifier(undefined)).toBe(0);
  });

  it("still reads the penalty an older save's Shackles carried in a custom row", () => {
    expect(skillCheckModifier([effect('racial-shackles', [{ field: 'custom', customLabel: 'all', value: -4 }]), effect('x', [{ field: 'custom', value: -9 }])])).toBe(-4);
  });
});
