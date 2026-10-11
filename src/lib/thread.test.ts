import { describe, expect, it } from 'vitest';
import {
  addFlashpoint,
  addProgress,
  applyDiscovery,
  discoveryCheck,
  discoveryOutcome,
  flashpointDue,
  hasTrack,
  owedPhase,
  plotArmor,
  type ThreadState,
} from './thread';

const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
/** The fraction that makes a d100 land on `n`. */
const pct = (n: number) => (n - 0.5) / 100;
/** The fraction that makes a d10 land on `n`. */
const d10 = (n: number) => (n - 0.5) / 10;

const track = (size: number, progress = 0, flashpoints = 0): ThreadState => ({ trackSize: size, progress, flashpoints });

describe('plot armor', () => {
  it('guards a thread with a track until the track is full', () => {
    expect(plotArmor(track(10, 8))).toBe(true);
    expect(plotArmor(track(10, 10))).toBe(false);
  });

  it('does not guard a thread without a track', () => {
    expect(plotArmor(track(0))).toBe(false);
    expect(hasTrack({ kind: 'thread', trackSize: 0 })).toBe(false);
    expect(hasTrack({ kind: 'npc', trackSize: 10 })).toBe(false);
  });
});

describe('progress', () => {
  it('adds points and stops at the size of the track', () => {
    expect(addProgress(track(10, 4), 2).progress).toBe(6);
    expect(addProgress(track(10, 9), 2).progress).toBe(10);
  });
});

describe('flashpoints', () => {
  it('are owed once a five-point phase ends without one', () => {
    expect(flashpointDue(track(15, 4))).toBe(false);
    expect(owedPhase(track(15, 5))).toBe(0);
    expect(flashpointDue(track(15, 5, 0b1))).toBe(false);
    expect(owedPhase(track(15, 10, 0b1))).toBe(1);
  });

  it('count as progress and settle the owed phase first', () => {
    const owed = addFlashpoint(track(15, 6), 2);
    expect(owed).toMatchObject({ progress: 8, flashpoints: 0b1 });
    expect(flashpointDue(owed)).toBe(false);
  });

  it('settle the current phase when nothing is owed', () => {
    expect(addFlashpoint(track(15, 2), 2)).toMatchObject({ progress: 4, flashpoints: 0b1 });
  });

  it('owe nothing without a track', () => {
    expect(owedPhase(track(0, 0))).toBeNull();
  });
});

describe('discovery', () => {
  it('reads the table by bands', () => {
    expect(discoveryOutcome(3)).toEqual({ kind: 'progress', points: 2 });
    expect(discoveryOutcome(10)).toEqual({ kind: 'track', points: 1 });
    expect(discoveryOutcome(12)).toEqual({ kind: 'flashpoint', points: 2 });
    expect(discoveryOutcome(16)).toEqual({ kind: 'progress', points: 3 });
    expect(discoveryOutcome(19)).toEqual({ kind: 'flashpoint', points: 3 });
    expect(discoveryOutcome(22)).toEqual({ kind: 'track', points: 2 });
    expect(discoveryOutcome(26)).toEqual({ kind: 'strengthen', points: 2 });
  });

  it('rolls the table once for a yes, adding the points already earned to the d10', () => {
    const check = discoveryCheck(track(20, 6), 5, sequence(pct(30), pct(99), d10(7)));
    expect(check.question.answer).toBe('yes');
    expect(check.finds).toHaveLength(1);
    expect(check.finds[0]).toMatchObject({ d10: 7, total: 13, result: { kind: 'flashpoint', points: 2 } });
  });

  it('rolls twice for an exceptional yes and not at all for a no', () => {
    expect(discoveryCheck(track(10, 0), 5, sequence(pct(2), pct(99), d10(1), d10(1))).finds).toHaveLength(2);
    const no = discoveryCheck(track(10, 0), 5, sequence(pct(70), pct(99)));
    expect(no.finds).toHaveLength(0);
    expect(no.deadEnd).toBe(false);
  });

  it('is a dead end for the scene after an exceptional no', () => {
    expect(discoveryCheck(track(10, 0), 5, sequence(pct(99), pct(99))).deadEnd).toBe(true);
  });

  it('applies every find to the thread', () => {
    const check = discoveryCheck(track(15, 0), 5, sequence(pct(2), pct(99), d10(1), d10(10)));
    // d10 1 → total 1 → progress +2; d10 10 → total 10 (progress is still 0 when rolled) → track +1
    const after = applyDiscovery(track(15, 0), check);
    expect(after.progress).toBe(3);
  });
});
