import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rollWeaponDamage, type DamageRoll } from '../../lib/formulas/damage-roll';
import styles from './DiceRoll.module.css';

/** What declared feats add to one attack — see lib/formulas/attack-modifiers.ts. */
export interface DamageOptions {
  /** [Lethal Strike]: a 2d roll of 3-11 counts one higher, for the table and the Critical Value. */
  lethal?: boolean;
  /** Flat damage added to the Calculated Damage to make the Total Damage. */
  bonusDamage?: number;
  /** Feats responsible for the above, named in the readout. */
  appliedFeats?: string[];
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

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setRoll(rollWeaponDamage(power, criticalValue, extraDamage, options.lethal))}
        aria-label={t('sheet.damageRollAria', { label })}
      >
        {t('sheet.damageRollButton')}
      </button>
      {roll && (
        <span className={styles.result} role="status">
          {roll.fumble ? (
            <span className={styles.fumble}>
              {t('sheet.damageRollStep', { ...roll.steps[0] })} — {t('sheet.damageRollFumble')}
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
            </>
          )}
        </span>
      )}
    </span>
  );
}
