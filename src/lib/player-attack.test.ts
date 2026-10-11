import { describe, expect, it } from 'vitest';
import { rollAccuracy, resolveAttackSequence, snipeDoubles } from './player-attack';

/** An rng that deals the given die faces in order. */
const dice = (...faces: number[]) => {
  let index = 0;
  return () => (faces[index++] - 1 + 0.5) / 6;
};

describe('rollAccuracy', () => {
  it('adds the Total Accuracy to 2d6', () => {
    expect(rollAccuracy(3, dice(3, 4))).toMatchObject({ dice: [3, 4], successValue: 10, outcome: null });
  });

  it('marks a double 1 as a fumble and a double 6 as an automatic success', () => {
    expect(rollAccuracy(9, dice(1, 1)).outcome).toBe('fumble');
    expect(rollAccuracy(0, dice(6, 6)).outcome).toBe('critical');
  });
});

describe('resolveAttackSequence', () => {
  const goblin = { key: 'g:0', evasion: 3 };
  const ogre = { key: 'o:0', evasion: 8 };

  it('hits only when the Success Value beats the Evasion check, ties going to the defender', () => {
    // Accuracy 2d6=3+4 +2 = 9 against fixed Evasion 3+7 = 10 and 8+7 = 15: a miss on both.
    const miss = resolveAttackSequence(2, [goblin, ogre], { fixed: true, repeated: false }, dice(3, 4));
    expect(miss.hits).toEqual([]);
    // Against a rolled Evasion: goblin 2d6=2+3 +3 = 8 (hit by 1), ogre 4+5 +8 = 17 (miss).
    const mixed = resolveAttackSequence(2, [goblin, ogre], { fixed: false, repeated: false }, dice(3, 4, 2, 3, 4, 5));
    expect(mixed.hits).toEqual([{ key: 'g:0', onFirst: true, margin: 1 }]);
  });

  it('rolls Accuracy once for every target of a [Cleave] attack', () => {
    const result = resolveAttackSequence(5, [goblin, ogre], { fixed: true, repeated: false }, dice(5, 5));
    expect(result.first.attack.successValue).toBe(15);
    expect(result.hits.map((hit) => hit.key)).toEqual(['g:0']);
    expect(result.first.outcomes.map((outcome) => outcome.margin)).toEqual([5, 0]);
  });

  it('lets a double 6 hit regardless of Evasion and a double 1 miss regardless', () => {
    expect(resolveAttackSequence(-5, [ogre], { fixed: true, repeated: false }, dice(6, 6)).hits).toHaveLength(1);
    expect(resolveAttackSequence(20, [goblin], { fixed: true, repeated: false }, dice(1, 1)).hits).toHaveLength(0);
  });

  it('attacks again, with a fresh roll, only those who evaded under [Repeated Strike]', () => {
    // First: 2d6=2+3 +2 = 7 hits the goblin (fixed 10)? No: 7 < 10, both evade. Second: 6+5 +2 = 13 hits the goblin only.
    const result = resolveAttackSequence(2, [goblin, ogre], { fixed: true, repeated: true }, dice(2, 3, 6, 5));
    expect(result.second?.outcomes.map((outcome) => outcome.key)).toEqual(['g:0', 'o:0']);
    expect(result.hits).toEqual([{ key: 'g:0', onFirst: false, margin: 3 }]);
  });

  it('does not repeat against a target that was hit, nor when nobody evaded', () => {
    const result = resolveAttackSequence(8, [goblin], { fixed: true, repeated: true }, dice(3, 4));
    expect(result.second).toBeNull();
    expect(result.hits).toEqual([{ key: 'g:0', onFirst: true, margin: 5 }]);
  });
});

describe('snipeDoubles', () => {
  it('needs a Success Value 3 or more above the target\'s', () => {
    expect(snipeDoubles(2)).toBe(false);
    expect(snipeDoubles(3)).toBe(true);
  });
});
