import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { racialStateOf } from '../../lib/racial-abilities';
import { MIRROR_MARGIN, mirrorReflects, raceSoulscars, REVENANT_AT, shacklesPenalty, shacklesSlowed, soulscarsOf, soulscarSums, withShackles } from '../../lib/soulscars';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import styles from './CharacterSheetView.module.css';
import { GameIcon } from '../../components/icons';

/**
 * Soulscars (Core I pp. 185, 319; Barbarous Rage pp. 69-73): the count (the race's, or the player's own: every resurrection
 * adds one), and, for a character that has any, what the items that run on it come to, the [Soulscar Shackles] penalty
 * (carried by a status effect that follows the count) and the Mirror's check against an [Evil Eye of Petrification].
 */
export function SoulscarsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [willpower, setWillpower] = useState('');
  const [eye, setEye] = useState('');

  const state = racialStateOf(character);
  const fromRace = raceSoulscars(character.raceId, state.witch);
  const count = soulscarsOf(character);
  /* Most Humanoids have none, and then only the count and the resurrection button show; the items matter once there is a scar. */
  const full = count > 0 || state.shackled;

  const rangerLevel = character.classes.filter((entry) => entry.classId === 'ranger').reduce((max, entry) => Math.max(max, entry.level), 0);
  const sums = soulscarSums(count, rangerLevel, abilityModifier(abilityTotal(character.abilities.INT)));
  const penalty = shacklesPenalty(count);

  function apply(shackled: boolean, soulscars: number | undefined) {
    update((c) => {
      const racial = { ...racialStateOf(c), shackled, soulscars };
      const effective = soulscars ?? raceSoulscars(c.raceId, racial.witch);
      return { ...c, racial, statusEffects: withShackles(c.statusEffects, shackled, effective, t('sheet.soulscars.shacklesEffect'), t('sheet.soulscars.allSkillChecks')) };
    });
  }

  const resurrect = () => apply(state.shackled, count + 1);
  const willpowerResult = willpower === '' ? null : Number(willpower);
  const eyeValue = eye === '' ? null : Number(eye);

  return (
    <section className={styles.section} aria-labelledby="section-soulscars">
      <div className={styles.sectionHead}>
        <h3 id="section-soulscars"><GameIcon name="section.soulscars" />{t('sheet.soulscars.title')}</h3>
        <p className={styles.sectionNote}>{t('sheet.soulscars.note')}</p>
      </div>

      <div className={styles.subsection}>
        <p>
          <label>
            {t('sheet.soulscars.count')}{' '}
            <input type="number" min={0} max={20} value={count} onChange={(event) => apply(state.shackled, Math.max(0, Math.min(20, Math.trunc(Number(event.target.value) || 0))))} aria-label={t('sheet.soulscars.count')} />
          </label>{' '}
          {state.soulscars !== undefined && (
            <button type="button" onClick={() => apply(state.shackled, undefined)}>
              {t('sheet.soulscars.reset', { count: fromRace })}
            </button>
          )}
        </p>
        <p>
          <button type="button" onClick={resurrect}>
            {t('sheet.soulscars.resurrected')}
          </button>
        </p>
        {count >= REVENANT_AT && <p className={styles.sectionNote}>{t('sheet.soulscars.revenant', { at: REVENANT_AT })}</p>}
        {full && (
          <>
            <ul className={styles.sectionNote}>
              <li>{t('sheet.soulscars.sumBonus', { count: sums.bonus })}</li>
              <li>{t('sheet.soulscars.sumTinted', { power: sums.tintedPower })}</li>
              <li>{t('sheet.soulscars.sumWine', { hp: sums.wineHp })}</li>
              <li>{t('sheet.soulscars.sumVisor', { hours: sums.visorHours })}</li>
            </ul>

            <label>
              <input type="checkbox" checked={state.shackled} onChange={(event) => apply(event.target.checked, state.soulscars)} /> {t('sheet.soulscars.shackles')}
            </label>
            {state.shackled && (
              <p className={styles.sectionNote}>
                {penalty > 0 ? t('sheet.soulscars.shacklesHold', { penalty }) : t('sheet.soulscars.shacklesFree')}
                {shacklesSlowed(count) && ` ${t('sheet.soulscars.shacklesSlow')}`}
              </p>
            )}
          </>
        )}
      </div>

      {full && (
      <div className={styles.subsection}>
        <h4 className={styles.subHead}>{t('sheet.soulscars.mirror')}</h4>
        <p>
          <label>
            {t('sheet.soulscars.mirrorWillpower')}{' '}
            <input type="number" value={willpower} onChange={(event) => setWillpower(event.target.value)} aria-label={t('sheet.soulscars.mirrorWillpower')} />
          </label>{' '}
          <label>
            {t('sheet.soulscars.mirrorEye')}{' '}
            <input type="number" value={eye} onChange={(event) => setEye(event.target.value)} aria-label={t('sheet.soulscars.mirrorEye')} />
          </label>
        </p>
        {willpowerResult !== null && eyeValue !== null && (
          <p role="status">{t(mirrorReflects(willpowerResult, eyeValue) ? 'sheet.soulscars.mirrorReflected' : 'sheet.soulscars.mirrorNot', { margin: MIRROR_MARGIN })}</p>
        )}
      </div>
      )}
    </section>
  );
}
