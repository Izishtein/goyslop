import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { powerTableRoll } from '../../lib/formulas/power-table';
import styles from './DiceRoll.module.css';

interface DamageStep {
  d1: number;
  d2: number;
  sum: number;
  value: number;
}

interface DamageRoll {
  steps: DamageStep[];
  fumble: boolean;
  powerTableTotal: number;
  calculatedDamage: number;
}

function rollD6(): number {
  return 1 + Math.floor(Math.random() * 6);
}

/** Core Rulebook I pp. 134-136: roll 2d6 on the weapon's Power row; a natural 2 (double 1s)
 *  deals zero damage outright, Extra Damage included, and stops here. Otherwise, whenever a
 *  roll is at or above the Critical Value the table is rolled again and added — a natural 2
 *  during that chain adds nothing and ends the chain (it can never itself be >= Critical
 *  Value, since the book clamps every Critical Value to at least 8, so the loop condition
 *  below stops on it without needing a separate check). Extra Damage is added exactly once,
 *  after every roll in the chain is in. */
function rollWeaponDamage(power: number, criticalValue: number, extraDamage: number): DamageRoll {
  const steps: DamageStep[] = [];
  let sum = 0;
  let d1 = 0;
  let d2 = 0;
  let powerTableTotal = 0;
  let first = true;
  let continuing = true;
  while (continuing) {
    d1 = rollD6();
    d2 = rollD6();
    sum = d1 + d2;
    if (sum === 2) {
      if (first) {
        return { steps: [{ d1, d2, sum, value: 0 }], fumble: true, powerTableTotal: 0, calculatedDamage: 0 };
      }
      steps.push({ d1, d2, sum, value: 0 });
      break;
    }
    const value = powerTableRoll(power, sum);
    steps.push({ d1, d2, sum, value });
    powerTableTotal += value;
    continuing = sum >= criticalValue;
    first = false;
  }
  return { steps, fumble: false, powerTableTotal, calculatedDamage: powerTableTotal + extraDamage };
}

export function WeaponDamageRoll({
  power,
  criticalValue,
  extraDamage,
  label,
}: {
  power: number;
  criticalValue: number;
  extraDamage: number;
  label: string;
}) {
  const { t } = useTranslation();
  const [roll, setRoll] = useState<DamageRoll | null>(null);

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setRoll(rollWeaponDamage(power, criticalValue, extraDamage))}
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
                </span>
              ))}
              {' — '}
              {t('sheet.damageRollTotal', {
                total: roll.powerTableTotal,
                extraDamage,
                calculated: roll.calculatedDamage,
              })}
              {roll.steps.length > 1 && <span className={styles.critical}> ({t('sheet.damageRollCritical')})</span>}
            </>
          )}
        </span>
      )}
    </span>
  );
}
