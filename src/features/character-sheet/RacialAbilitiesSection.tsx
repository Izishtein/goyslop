import { useTranslation } from 'react-i18next';
import { abilityTotal } from '../../lib/formulas/abilities';
import { abilityModifier } from '../../lib/formulas/abilities';
import { adventurerLevel, wizardLevelSum } from '../../lib/formulas/character-levels';
import { hpMax, mpMax } from '../../lib/formulas/hp-mp';
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
  SPIRIT_DRAIN,
  spiritDrain,
  WEAKENED_PENALTY,
  WITCH_MAGIC_POWER,
  withWeakened,
} from '../../lib/racial-abilities';
import { raceSoulscars, soulscarsOf, withShackles } from '../../lib/soulscars';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, RacialState } from '../../types/character';
import styles from './CharacterSheetView.module.css';
import { GameIcon } from '../../components/icons';

const RACES_WITH_ACTIVES = ['dark-troll', 'baba-yaga', 'kobold', 'alv'];

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

  /* The witch's shape adds two soulscars, and the shackles' penalty follows the count. */
  function setWitch(witch: boolean) {
    update((c) => {
      const racial = { ...racialStateOf(c), witch };
      const count = racial.soulscars ?? raceSoulscars(c.raceId, witch);
      return { ...c, racial, statusEffects: racial.shackled ? withShackles(c.statusEffects, true, count, t('sheet.soulscars.shacklesEffect')) : c.statusEffects };
    });
  }

  /* The MP taken comes to the Alv; the target's side is the table's business. */
  function drainNow() {
    update((c) => {
      const ceiling = mpMax(wizardLevelSum(c.classes), abilityTotal(c.abilities.SPR));
      const used = racialStateOf(c).usedToday.filter((id) => id.startsWith(SPIRIT_DRAIN)).length;
      return { ...c, mp: { current: Math.max(c.mp.current, Math.min(ceiling, c.mp.current + drain.amount)) }, racial: markUsed(racialStateOf(c), `${SPIRIT_DRAIN}-${used + 1}`, 'day') };
    });
  }

  function regenerateNow() {
    update((c) => {
      const max = hpMax(adventurerLevel(c.classes), abilityTotal(c.abilities.VIT));
      return { ...c, hp: { current: regenerate(c.hp.current, max, adventurerLevel(c.classes)) }, racial: markUsed(racialStateOf(c), LIMITED_REGENERATION, 'day') };
    });
  }

  const drain = spiritDrain(abilityModifier(abilityTotal(character.abilities.SPR)), soulscarsOf(character), level);
  const drainsUsed = state.usedToday.filter((id) => id.startsWith(SPIRIT_DRAIN)).length;
  const regeneration = limitedRegeneration(level);
  const anySpent = state.usedToday.length > 0 || state.usedInCombat.length > 0;

  return (
    <section className={styles.section} aria-labelledby="section-racial">
      <div className={styles.sectionHead}>
        <h3 id="section-racial"><GameIcon name="section.racial" />{t('sheet.racial.title')}</h3>
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
              <input type="checkbox" checked={state.witch} onChange={(event) => setWitch(event.target.checked)} /> {t('sheet.racial.witch')}
            </label>
            <p className={styles.sectionNote}>{t('sheet.racial.witchEffects', { power: WITCH_MAGIC_POWER, soulscars: babaYagaSoulscars(state.witch) })}</p>
          </>
        )}

        {character.raceId === 'alv' && (
          <p>
            <button type="button" onClick={drainNow} disabled={drainsUsed >= drain.perDay}>
              {t('sheet.racial.spiritDrain', { amount: drain.amount })}
            </button>{' '}
            <span className={styles.sectionNote}>
              {t('sheet.racial.spiritDrainUses', { left: Math.max(0, drain.perDay - drainsUsed), max: drain.perDay })} · {t(level >= 6 ? 'sheet.racial.drainRange' : 'sheet.racial.drainTouch')}
            </span>
          </p>
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
