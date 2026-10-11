import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { rollWeaponDamage, type DamageRoll } from '../../lib/formulas/damage-roll';
import { encounterAtom } from '../../state/encounter';
import { AttackTarget } from '../solo/AttackTarget';
import { FumbleXpButton } from './FumbleXp';
import styles from './DiceRoll.module.css';

/** What declared feats add to one attack — see lib/formulas/attack-modifiers.ts. */
export interface DamageOptions {
  /** [Lethal Strike]: a 2d roll of 3-11 counts one higher, for the table and the Critical Value. */
  lethal?: boolean;
  /** Flat damage added to the Calculated Damage to make the Total Damage. */
  bonusDamage?: number;
  /** Feats responsible for the above, named in the readout. */
  appliedFeats?: string[];
  /** [Armor Piercer] tier declared: the readout offers a target Defense and shows the damage dealt. */
  armorPiercer?: 0 | 1 | 2 | 3;
  /** [Snipe] declared: offer the doubling for a Success Value 3 or more above the target's. */
  snipe?: boolean;
  /** [Repeated Strike II] declared: offer +4 damage for a hit on the first Accuracy check. */
  repeatedStrikeII?: boolean;
  /** The Accuracy check has been made against this target (key of the table row): it is preselected. */
  presetTarget?: string;
  /** [Snipe] decided by the Success Values of an automatic Accuracy check, not by a checkbox. */
  snipeAuto?: boolean;
  /** [Repeated Strike II] decided by which Accuracy check hit, not by a checkbox. */
  firstHitAuto?: boolean;
}

export function WeaponDamageRoll({
  power,
  criticalValue,
  extraDamage,
  label,
  options = {},
}: {
  power: number;
  criticalValue: number;
  extraDamage: number;
  label: string;
  options?: DamageOptions;
}) {
  const bonus = options.bonusDamage ?? 0;
  const { t } = useTranslation();
  const [roll, setRoll] = useState<DamageRoll | null>(null);
  const tier = options.armorPiercer ?? 0;
  const [doubled, setDoubled] = useState(false);
  const [firstHit, setFirstHit] = useState(false);
  const doubledNow = options.snipeAuto ?? doubled;
  const firstHitNow = options.firstHitAuto ?? firstHit;
  const repeatBonus = options.repeatedStrikeII && firstHitNow ? 4 : 0;
  const hasMonsters = useAtomValue(encounterAtom).monsters.length > 0;

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          setRoll(rollWeaponDamage(power, criticalValue, extraDamage, options.lethal));
        }}
        aria-label={t('sheet.damageRollAria', { label })}
      >
        {t('sheet.damageRollButton')}
      </button>
      {roll && (
        <span className={styles.result} role="status">
          {roll.fumble ? (
            <span className={styles.fumble}>
              {t('sheet.damageRollStep', { ...roll.steps[0] })} — {t('sheet.damageRollFumble')}
              <FumbleXpButton roll={roll} />
            </span>
          ) : (
            <>
              {roll.steps.map((step, index) => (
                <span key={index}>
                  {index > 0 && ' + '}
                  {t('sheet.damageRollStep', { ...step })}
                  {step.bumped && ' (+1)'}
                </span>
              ))}
              {' — '}
              {t('sheet.damageRollTotal', {
                total: roll.powerTableTotal,
                extraDamage,
                calculated: roll.calculatedDamage,
              })}
              {roll.steps.length > 1 && <span className={styles.critical}> ({t('sheet.damageRollCritical')})</span>}
              {bonus !== 0 && (
                <span>
                  {' '}
                  {t('sheet.damageRollTotalDamage', {
                    feats: (options.appliedFeats ?? []).join(', '),
                    bonus,
                    total: roll.calculatedDamage + bonus,
                  })}
                </span>
              )}
              {options.repeatedStrikeII && options.firstHitAuto === undefined && (
                <label>
                  {' '}
                  <input type="checkbox" checked={firstHit} onChange={(event) => setFirstHit(event.target.checked)} /> {t('sheet.repeatedHit', { total: roll.calculatedDamage + bonus + 4 })}
                </label>
              )}
              {options.repeatedStrikeII && options.firstHitAuto === true && <span> {t('sheet.repeatedHit', { total: roll.calculatedDamage + bonus + 4 })}</span>}
              {options.snipe && options.snipeAuto === undefined && (
                <label>
                  {' '}
                  <input type="checkbox" checked={doubled} onChange={(event) => setDoubled(event.target.checked)} /> {t('sheet.snipeDoubled', { total: (roll.calculatedDamage + bonus + repeatBonus) * 2 })}
                </label>
              )}
              {options.snipe && options.snipeAuto === true && <span> {t('sheet.snipeDoubled', { total: (roll.calculatedDamage + bonus + repeatBonus) * 2 })}</span>}
              {(tier > 0 || hasMonsters) && (
                <AttackTarget
                  tier={tier}
                  damage={(roll.calculatedDamage + bonus + repeatBonus) * (doubledNow ? 2 : 1)}
                  critical={roll.steps.length > 1}
                  initialTarget={options.presetTarget}
                />
              )}
            </>
          )}
        </span>
      )}
    </span>
  );
}
