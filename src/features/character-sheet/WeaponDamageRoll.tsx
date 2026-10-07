import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { rollWeaponDamage, type DamageRoll } from '../../lib/formulas/damage-roll';
import { activeCharacterIdAtom, useUpdateCharacter } from '../../state/characters';
import styles from './DiceRoll.module.css';

/** A double 1 on the first Power Table roll earns the roller 50 experience points (CR I pp. 134, 169). */
const FUMBLE_XP = 50;

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
  const [xpGiven, setXpGiven] = useState(false);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const updateCharacter = useUpdateCharacter(activeId ?? '');

  function award() {
    updateCharacter((c) => ({ ...c, experience: { ...c.experience, total: c.experience.total + FUMBLE_XP } }));
    setXpGiven(true);
  }

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          setRoll(rollWeaponDamage(power, criticalValue, extraDamage, options.lethal));
          setXpGiven(false);
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
              {activeId && (
                <button type="button" className={styles.button} onClick={award} disabled={xpGiven}>
                  {xpGiven ? t('sheet.damageRollXpGiven') : t('sheet.damageRollXp')}
                </button>
              )}
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
