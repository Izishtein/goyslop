import { describe, expect, it } from 'vitest';
import { halveRoundUp, rollSpellcastingCheck, spellResisted } from './spell-check';

const dice = (a: number, b: number) => {
  const faces = [a, b];
  return () => (faces.shift()! - 1) / 6;
};

describe('Spellcasting check', () => {
  it('is 2d6 plus Magic Power, with double 6s and double 1s flagged', () => {
    expect(rollSpellcastingCheck(5, dice(3, 4))).toEqual({ dice: [3, 4], value: 12, outcome: null });
    expect(rollSpellcastingCheck(5, dice(6, 6)).outcome).toBe('critical');
    expect(rollSpellcastingCheck(5, dice(1, 1)).outcome).toBe('fumble');
  });

  it('is resisted on a tie or a higher Willpower, never on a lower one', () => {
    const caster = { dice: [3, 4] as [number, number], value: 12, outcome: null };
    expect(spellResisted(caster, { dice: null, value: 12, outcome: null })).toBe(true);
    expect(spellResisted(caster, { dice: null, value: 11, outcome: null })).toBe(false);
    expect(spellResisted(caster, { dice: [6, 6], value: 2, outcome: 'critical' })).toBe(true);
    expect(spellResisted(caster, { dice: [1, 1], value: 40, outcome: 'fumble' })).toBe(false);
  });

  it('halves damage rounding up', () => {
    expect(halveRoundUp(7)).toBe(4);
    expect(halveRoundUp(8)).toBe(4);
  });
});
