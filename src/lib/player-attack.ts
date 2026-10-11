import { rollD6, rollEvasion, resolveAttack, type EvasionRoll, type MonsterAttackRoll, type Rng } from './encounter';

/** The player's Accuracy check: 2d6 + the weapon's Total Accuracy; a double 1 always misses, a double 6 always hits. */
export function rollAccuracy(accuracy: number, rng: Rng = Math.random): MonsterAttackRoll {
  const dice: [number, number] = [rollD6(rng), rollD6(rng)];
  const sum = dice[0] + dice[1];
  return { dice, successValue: sum + accuracy, outcome: sum === 2 ? 'fumble' : sum === 12 ? 'critical' : null };
}

export interface AttackTargetInput {
  key: string;
  /** The target's Evasion Standard Value (the monster card's, before the +7 of a Fixed Value). */
  evasion: number;
}

export interface TargetOutcome {
  key: string;
  evasion: EvasionRoll;
  hit: boolean;
  /** The Accuracy Success Value minus the target's: [Snipe] doubles at 3 or more. */
  margin: number;
}

/** One Accuracy check set against each target's own Evasion check (a [Cleave] attack rolls Accuracy once). */
export interface AttackPass {
  attack: MonsterAttackRoll;
  outcomes: TargetOutcome[];
}

function pass(accuracy: number, targets: AttackTargetInput[], fixed: boolean, rng: Rng): AttackPass {
  const attack = rollAccuracy(accuracy, rng);
  const outcomes = targets.map((target) => {
    const evasion = rollEvasion(target.evasion, fixed, rng);
    return { key: target.key, evasion, hit: resolveAttack(attack, evasion), margin: attack.successValue - evasion.value };
  });
  return { attack, outcomes };
}

export interface AttackSequence {
  first: AttackPass;
  /** [Repeated Strike]: one more Accuracy check against everyone who evaded the first. */
  second: AttackPass | null;
  /** Who ends up hit, and on which check; the [Repeated Strike II] bonus belongs to a first-check hit. */
  hits: { key: string; onFirst: boolean; margin: number }[];
}

/**
 * A whole attack declaration. One Accuracy check covers every target; with [Repeated Strike] the
 * targets that evaded are attacked once more (CR I p. 257 — "another Accuracy check can be
 * performed on all targets evading them").
 */
export function resolveAttackSequence(
  accuracy: number,
  targets: AttackTargetInput[],
  options: { fixed: boolean; repeated: boolean },
  rng: Rng = Math.random,
): AttackSequence {
  const first = pass(accuracy, targets, options.fixed, rng);
  const evaded = targets.filter((target) => !first.outcomes.find((outcome) => outcome.key === target.key)?.hit);
  const second = options.repeated && evaded.length > 0 ? pass(accuracy, evaded, options.fixed, rng) : null;
  const hits = [
    ...first.outcomes.filter((outcome) => outcome.hit).map((outcome) => ({ key: outcome.key, onFirst: true, margin: outcome.margin })),
    ...(second?.outcomes.filter((outcome) => outcome.hit).map((outcome) => ({ key: outcome.key, onFirst: false, margin: outcome.margin })) ?? []),
  ];
  return { first, second, hits };
}

/** [Snipe]: the Total Damage doubles when the Success Value beats the target's by 3 or more. */
export function snipeDoubles(margin: number): boolean {
  return margin >= 3;
}
