import { describe, expect, it } from 'vitest';
import type { StatusEffect } from '../../types/character';
import { sumModifiersForField, tickStatusEffects } from './status-effects';

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
