import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DiceRoll.module.css';

/** SW 2.5's universal check: 2d6 + Standard Value vs a Target Number the table sets on the
 *  spot, with two fixed outcomes independent of any modifier (03-ability-scores-and-formulas.md):
 *  snake eyes (2) is always a failure, boxcars (12) is always a success. This button rolls that
 *  2d6 for a single already-computed Standard Value — Fortitude, Willpower, Accuracy, Evasion,
 *  Magic Power, a check package — not a weapon's damage roll, which needs the Power Table
 *  (never digitized here, see docs/sheet-content/06-equipment.md) to turn a 2d6 result into a
 *  number at all. */
export function DiceRoll({ modifier, label }: { modifier: number; label: string }) {
  const { t } = useTranslation();
  const [roll, setRoll] = useState<{ d1: number; d2: number; outcome: 'fumble' | 'critical' | null } | null>(null);

  function rollDice() {
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const raw = d1 + d2;
    setRoll({ d1, d2, outcome: raw === 2 ? 'fumble' : raw === 12 ? 'critical' : null });
  }

  const total = roll ? roll.d1 + roll.d2 + modifier : null;
  const sign = modifier >= 0 ? '+' : '−';

  return (
    <span className={styles.wrap}>
      <button type="button" className={styles.button} onClick={rollDice} aria-label={t('sheet.rollAria', { label })}>
        {t('sheet.rollButton')}
      </button>
      {roll && total !== null && (
        <span className={styles.result} role="status">
          {t('sheet.rollResult', { d1: roll.d1, d2: roll.d2, sign, modAbs: Math.abs(modifier), total })}
          {roll.outcome === 'fumble' && <span className={styles.fumble}> — {t('sheet.rollFumble')}</span>}
          {roll.outcome === 'critical' && <span className={styles.critical}> — {t('sheet.rollCritical')}</span>}
        </span>
      )}
    </span>
  );
}
