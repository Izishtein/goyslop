import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { activeCharacterIdAtom, useUpdateCharacter } from '../../state/characters';
import styles from './DiceRoll.module.css';

/** A double 1 on a 2d roll earns the roller 50 experience points (CR I pp. 134, 169). */
export const FUMBLE_XP = 50;

/**
 * The "+50 XP" button next to a fumble. It writes to the open character and is off once pressed;
 * with no character open there is nobody to pay, so it does not appear. `roll` is the roll it belongs to:
 * a new roll is a new fumble and the button is armed again.
 */
export function FumbleXpButton({ roll }: { roll: unknown }) {
  const { t } = useTranslation();
  const activeId = useAtomValue(activeCharacterIdAtom);
  const updateCharacter = useUpdateCharacter(activeId ?? '');
  const [paidFor, setPaidFor] = useState<unknown>(null);
  if (!activeId) return null;
  const paid = paidFor === roll;
  return (
    <button
      type="button"
      className={styles.button}
      disabled={paid}
      onClick={() => {
        updateCharacter((c) => ({ ...c, experience: { ...c.experience, total: c.experience.total + FUMBLE_XP } }));
        setPaidFor(roll);
      }}
    >
      {paid ? t('sheet.damageRollXpGiven') : t('sheet.damageRollXp')}
    </button>
  );
}
