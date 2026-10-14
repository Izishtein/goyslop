import { useTranslation } from 'react-i18next';
import { abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { hpMax } from '../../lib/formulas/hp-mp';
import {
  babaYagaSoulscars,
  DISREGARD,
  LIMITED_REGENERATION,
  limitedRegeneration,
  markUsed,
  newCombat,
  newDay,
  racialStateOf,
  regenerate,
  WEAKENED_PENALTY,
  WITCH_MAGIC_POWER,
  withWeakened,
} from '../../lib/racial-abilities';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, RacialState } from '../../types/character';
import styles from './CharacterSheetView.module.css';

const RACES_WITH_ACTIVES = ['dark-troll', 'baba-yaga', 'kobold'];

/**
 * The active abilities of the Barbarous races with one body (Barbarous Rage pp. 24, 32, 48): a Dark Troll's
 * [Weakened] in sunlight (a status effect that lowers Accuracy and Evasion) and [Limited Regeneration] once a day, a
 * Baba Yaga's [Witch Transformation] (+1 Magic Power, soulscars 2 → 4; [Witch's Fire] is on the cast log of the
 * Spells section) and a Kobold's [Disregard] once a combat. What is spent stays spent until "New combat" / "New day".
 */
export function RacialAbilitiesSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  if (!RACES_WITH_ACTIVES.includes(character.raceId)) return null;

  const state = racialStateOf(character);
  const level = adventurerLevel(character.classes);
  const spent = (id: string) => state.usedToday.includes(id) || state.usedInCombat.includes(id);
  const set = (next: (current: RacialState) => RacialState) => update((c) => ({ ...c, racial: next(racialStateOf(c)) }));

  function setSunlight(sunlight: boolean) {
    update((c) => ({ ...c, racial: { ...racialStateOf(c), sunlight }, statusEffects: withWeakened(c.statusEffects, sunlight, t('sheet.racial.weakenedEffect')) }));
  }

  function regenerateNow() {
    update((c) => {
      const max = hpMax(adventurerLevel(c.classes), abilityTotal(c.abilities.VIT));
      return { ...c, hp: { current: regenerate(c.hp.current, max, adventurerLevel(c.classes)) }, racial: markUsed(racialStateOf(c), LIMITED_REGENERATION, 'day') };
    });
  }

  const regeneration = limitedRegeneration(level);
  const anySpent = state.usedToday.length > 0 || state.usedInCombat.length > 0;

  return (
    <section className={styles.section} aria-labelledby="section-racial">
      <div className={styles.sectionHead}>
        <h3 id="section-racial">{t('sheet.racial.title')}</h3>
        <p className={styles.sectionNote}>{t(`sheet.racial.note.${character.raceId}`)}</p>
      </div>

      <div className={styles.subsection}>
        {character.raceId === 'dark-troll' && (
          <>
            <label>
              <input type="checkbox" checked={state.sunlight} onChange={(event) => setSunlight(event.target.checked)} /> {t('sheet.racial.sunlight', { penalty: WEAKENED_PENALTY })}
            </label>
            {regeneration.available && (
              <p>
                <button type="button" onClick={regenerateNow} disabled={spent(LIMITED_REGENERATION)}>
                  {t('sheet.racial.regenerate', { amount: regeneration.amount })}
                </button>{' '}
                <span className={styles.sectionNote}>
                  {t(regeneration.minor ? 'sheet.racial.minorAction' : 'sheet.racial.majorAction')} · {t('sheet.racial.oncePerDay')}
                  {spent(LIMITED_REGENERATION) && ` — ${t('sheet.racial.spent')}`}
                </span>
              </p>
            )}
          </>
        )}

        {character.raceId === 'baba-yaga' && (
          <>
            <label>
              <input type="checkbox" checked={state.witch} onChange={(event) => set((current) => ({ ...current, witch: event.target.checked }))} /> {t('sheet.racial.witch')}
            </label>
            <p className={styles.sectionNote}>{t('sheet.racial.witchEffects', { power: WITCH_MAGIC_POWER, soulscars: babaYagaSoulscars(state.witch) })}</p>
          </>
        )}

        {character.raceId === 'kobold' && (
          <p>
            <button type="button" onClick={() => set((current) => markUsed(current, DISREGARD, 'combat'))} disabled={spent(DISREGARD)}>
              {t('sheet.racial.disregard')}
            </button>{' '}
            <span className={styles.sectionNote}>
              {t('sheet.racial.oncePerCombat')}
              {spent(DISREGARD) && ` — ${t('sheet.racial.spent')}`}
            </span>
          </p>
        )}

        {anySpent && (
          <p>
            <button type="button" onClick={() => set(newCombat)}>
              {t('sheet.racial.newCombat')}
            </button>{' '}
            <button type="button" onClick={() => set(newDay)}>
              {t('sheet.racial.newDay')}
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
