import type { StatusEffect, StatusEffectField, StatusEffectModifier } from '../../types/character';

/** Decrements round-based durations by one; effects reaching 0 remaining are dropped. */
export function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((effect) =>
      effect.duration.kind === 'rounds'
        ? { ...effect, duration: { ...effect.duration, remaining: effect.duration.remaining - 1 } }
        : effect,
    )
    .filter((effect) => effect.duration.kind !== 'rounds' || effect.duration.remaining > 0);
}

/** Sums all modifiers targeting a given field across active status effects. */
export function sumModifiersForField(effects: StatusEffect[], field: StatusEffectField): number {
  return effects
    .flatMap((effect) => effect.modifiers)
    .filter((modifier: StatusEffectModifier) => modifier.field === field)
    .reduce((total, modifier) => total + modifier.value, 0);
}
