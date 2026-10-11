import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { rollWeaponDamage, type DamageRoll } from '../../lib/formulas/damage-roll';
import { encounterAtom } from '../../state/encounter';
import { AttackTarget } from '../solo/AttackTarget';
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
  /** [Armor Piercer] tier declared: the readout offers a target Defense and shows the damage dealt. */
  armorPiercer?: 0 | 1 | 2 | 3;
  /** [Snipe] declared: offer the doubling for a Success Value 3 or more above the target's. */
  snipe?: boolean;
  /** [Repeated Strike II] declared: offer +4 damage for a hit on the first Accuracy check. */
  repeatedStrikeII?: boolean;
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
  const tier = options.armorPiercer ?? 0;
  const [doubled, setDoubled] = useState(false);
  const [firstHit, setFirstHit] = useState(false);
  const repeatBonus = options.repeatedStrikeII && firstHit ? 4 : 0;
  const hasMonsters = useAtomValue(encounterAtom).monsters.length > 0;
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
              {options.repeatedStrikeII && (
                <label>
                  {' '}
                  <input type="checkbox" checked={firstHit} onChange={(event) => setFirstHit(event.target.checked)} /> {t('sheet.repeatedHit', { total: roll.calculatedDamage + bonus + 4 })}
                </label>
              )}
              {options.snipe && (
                <label>
                  {' '}
                  <input type="checkbox" checked={doubled} onChange={(event) => setDoubled(event.target.checked)} /> {t('sheet.snipeDoubled', { total: (roll.calculatedDamage + bonus + repeatBonus) * 2 })}
                </label>
              )}
              {(tier > 0 || hasMonsters) && <AttackTarget tier={tier} damage={(roll.calculatedDamage + bonus + repeatBonus) * (doubled ? 2 : 1)} critical={roll.steps.length > 1} />}
            </>
          )}
        </span>
      )}
    </span>
  );
}
