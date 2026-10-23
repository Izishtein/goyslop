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

/** Id of the Soulscar Shackles effect; before 'skillChecks' existed it carried its penalty in a 'custom' row. */
const LEGACY_SHACKLES_ID = 'racial-shackles';

/** The modifier every skill check takes: the 'skillChecks' rows, plus the penalty of an older save's Shackles. */
export function skillCheckModifier(effects: StatusEffect[] | undefined): number {
  if (!effects) return 0;
  const legacy = effects
    .filter((effect) => effect.id === LEGACY_SHACKLES_ID)
    .flatMap((effect) => effect.modifiers)
    .filter((modifier) => modifier.field === 'custom')
    .reduce((total, modifier) => total + modifier.value, 0);
  return sumModifiersForField(effects, 'skillChecks') + legacy;
}

/**
 * Brings one app-managed status effect (the fatigue of a march, the hunger or the pitching deck of a voyage)
 * up to date in a list: added or replaced when it has modifiers, removed when it has none. Returns the same
 * array when nothing changes, so callers can compare by identity before writing.
 */
export function upsertManagedEffect(
  effects: StatusEffect[],
  id: string,
  name: string,
  source: string,
  modifiers: StatusEffectModifier[],
): StatusEffect[] {
  const current = effects.find((effect) => effect.id === id);
  if (modifiers.length === 0) return current ? effects.filter((effect) => effect.id !== id) : effects;
  if (current && current.name === name && JSON.stringify(current.modifiers) === JSON.stringify(modifiers)) return effects;
  const next: StatusEffect = { id, name, source, duration: { kind: 'untilRemoved' }, modifiers };
  return current ? effects.map((effect) => (effect.id === id ? next : effect)) : [...effects, next];
}
