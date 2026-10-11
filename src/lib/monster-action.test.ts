import { describe, expect, it } from 'vitest';
import { rollMonsterAction } from './monster-action';

const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
const pct = (n: number) => (n - 0.5) / 100;

describe('rollMonsterAction', () => {
  it('carries on with a yes, and plans nothing new', () => {
    const result = rollMonsterAction(5, sequence(pct(50), pct(99)));
    expect(result).toMatchObject({ answer: 'yes', action: null, strong: false, extra: null });
  });

  it('carries on harder with an exceptional yes', () => {
    expect(rollMonsterAction(5, sequence(pct(3), pct(99)))).toMatchObject({ answer: 'exceptionalYes', action: null, strong: true });
  });

  it('changes the plan with a no, naming the new action', () => {
    // chance 85 at chaos 5; d100 = 90 is a no; then the d12 (0.5 → 7)
    const result = rollMonsterAction(5, sequence(pct(90), pct(99), 0.5));
    expect(result).toMatchObject({ answer: 'no', action: 7, strong: false });
  });

  it('changes the plan hard with an exceptional no', () => {
    expect(rollMonsterAction(5, sequence(pct(100), pct(99), 0))).toMatchObject({ answer: 'exceptionalNo', action: 1, strong: true });
  });

  it('gives an extra action when the event die comes up', () => {
    const result = rollMonsterAction(5, sequence(pct(50), pct(10), 0, 0, 0, 0.99));
    expect(result.extra).toBe(12);
  });
});
