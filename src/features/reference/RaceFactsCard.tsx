import { useTranslation } from 'react-i18next';
import { getClass } from '../../data/classes';
import { racialAbilitiesFor, type BackgroundEntry, type RaceDefinition } from '../../data/races';
import { ABILITY_IDS } from '../../lib/formulas/abilities';
import { correctionRange, formatDiceNotation } from '../../lib/formulas/ability-base';
import styles from './RaceFactsCard.module.css';

/**
 * What a race actually commits you to, shown where the choice is made.
 *
 * Everything here was already in the data and invisible in the form: the correction dice
 * lived only in a `title=` tooltip on the Correction input — no use on a touch screen, to a
 * keyboard, or before you already knew to hover — and the restricted classes and racial
 * abilities were shown nowhere at all until the character existed.
 *
 * It deliberately repeats nothing the selects already say: no background name, no roll
 * range, no XP, no ability bases. Print needs no rules here — the whole creation form sits
 * inside a `<form>`, which print.css hides outright.
 */
export function RaceFactsCard({ race, background }: { race: RaceDefinition; background?: BackgroundEntry }) {
  const { t } = useTranslation();
  const abilities = racialAbilitiesFor(race.id);

  return (
    <aside className={styles.card} aria-label={t('reference.raceFacts', { race: race.name })}>
      {race.abilityDice ? (
        <div className={styles.dice}>
          {ABILITY_IDS.map((ability) => {
            const dice = race.abilityDice![ability];
            const { min, max } = correctionRange(dice);
            return (
              <div key={ability} className={styles.die}>
                <span className={styles.dieLabel}>{ability}</span>
                <strong>{formatDiceNotation(dice)}</strong>
                <span className={styles.range}>
                  {min}–{max}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.line}>{race.usesVagrantSystem ? t('reference.vagrantSystem') : t('reference.missingData')}</p>
      )}

      {race.restrictedClasses.length > 0 && (
        <p className={styles.line}>
          <span className={styles.label}>{t('reference.restrictedClasses')}</span>
          {race.restrictedClasses.map((id) => getClass(id)?.name ?? id).join(', ')}
        </p>
      )}

      {abilities.length > 0 && (
        <p className={styles.line}>
          <span className={styles.label}>{t('reference.racialAbilities')}</span>
          {abilities.map((ability) => `[${ability.name}]${ability.fromLevel > 0 ? ` Lv${ability.fromLevel}+` : ''}`).join(' · ')}
        </p>
      )}

      {background && (
        <p className={styles.line}>
          <span className={styles.label}>{t('creation.startingClass')}</span>
          {background.startingClasses
            ? background.startingClasses.classIds
                .map((id) => getClass(id)?.name ?? id)
                .join(background.startingClasses.joiner === 'or' ? t('reference.joinerOr') : t('reference.joinerAnd'))
            : '—'}
          {background.stats && (
            <span className={styles.split}>
              {t('creation.skill')} {background.stats[0]} · {t('creation.body')} {background.stats[1]} · {t('creation.mind')}{' '}
              {background.stats[2]}
            </span>
          )}
        </p>
      )}

      <p className={styles.source}>{race.sourceBook}</p>
    </aside>
  );
}
