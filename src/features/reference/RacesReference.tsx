import { useTranslation } from 'react-i18next';
import { getClass } from '../../data/classes';
import { RACES, racialAbilitiesFor, type RaceDefinition } from '../../data/races';
import { ABILITY_IDS } from '../../lib/formulas/abilities';
import { correctionRange, formatDiceNotation } from '../../lib/formulas/ability-base';
import styles from './ReferenceView.module.css';

/** "2d6+6 (8–18)" — the notation plus what it can actually roll. */
function diceCell(race: RaceDefinition, ability: (typeof ABILITY_IDS)[number]) {
  const dice = race.abilityDice?.[ability];
  if (!dice) return null;
  const { min, max } = correctionRange(dice);
  return (
    <>
      {formatDiceNotation(dice)}
      <span className={styles.range}>
        {min}–{max}
      </span>
    </>
  );
}

export function RacesReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-races">
      <div className={styles.panelHead}>
        <h3 id="reference-races">{t('reference.tab.races')}</h3>
        <p className={styles.note}>{t('reference.racesNote')}</p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('reference.race')}</th>
              {ABILITY_IDS.map((ability) => (
                <th key={ability}>{ability}</th>
              ))}
              <th>{t('reference.restrictedClasses')}</th>
              <th>{t('reference.racialAbilities')}</th>
              <th>{t('reference.book')}</th>
            </tr>
          </thead>
          <tbody>
            {RACES.map((race) => {
              const abilities = racialAbilitiesFor(race.id);
              return (
                <tr key={race.id}>
                  <th scope="row" className={styles.rowName}>
                    {race.name}
                  </th>
                  {/* Six of the eighteen races have no dice: Vagrant-system ones roll a
                      different way, and two are waiting on a sourcebook. Saying so beats
                      six empty cells, which read as a bug. */}
                  {race.abilityDice ? (
                    ABILITY_IDS.map((ability) => (
                      <td key={ability} className={styles.dice}>
                        {diceCell(race, ability)}
                      </td>
                    ))
                  ) : (
                    <td colSpan={ABILITY_IDS.length} className={styles.missing}>
                      {race.usesVagrantSystem ? t('reference.vagrantSystem') : t('reference.missingData')}
                    </td>
                  )}
                  <td>
                    {race.restrictedClasses.length > 0
                      ? race.restrictedClasses.map((id) => getClass(id)?.name ?? id).join(', ')
                      : t('reference.noRestrictions')}
                  </td>
                  <td>
                    {abilities.length > 0
                      ? abilities.map((ability) => (
                          <span key={`${ability.name}-${ability.fromLevel}`} className={styles.ability}>
                            [{ability.name}]{ability.fromLevel > 0 ? ` Lv${ability.fromLevel}+` : ''}
                          </span>
                        ))
                      : '—'}
                  </td>
                  <td>{race.sourceBook}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
