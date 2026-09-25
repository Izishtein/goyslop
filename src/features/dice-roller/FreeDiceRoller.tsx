import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FreeDiceRoller.module.css';

const DIE_SIZES = [4, 6, 8, 10, 12, 20, 100];

type Roll = { dice: number[]; sum: number; outcome: 'fumble' | 'critical' | null };

/** A free-standing NdM roller for whatever the table needs mid-scene and no Standard
 *  Value covers — a GM-called check, a d20 for a minigame, anything not already backed by
 *  a `<DiceRoll>` next to its own stat. Floats over every view (roster, sheet, reference,
 *  guide) rather than living on the character sheet, since "roll something right now" is
 *  not tied to whichever character happens to be open.
 *
 *  2d6 is still the default and still gets the sheet's fumble/critical read on 2 and 12
 *  (see DiceRoll.tsx) — that read is specific to SW2.5's universal check, not to dice size
 *  in general, so it only applies when the picked count/sides match that shape. */
export function FreeDiceRoller() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [modifier, setModifier] = useState(0);
  const [result, setResult] = useState<Roll | null>(null);

  function rollDice() {
    const dice = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
    const sum = dice.reduce((total, face) => total + face, 0);
    const outcome = count === 2 && sides === 6 ? (sum === 2 ? 'fumble' : sum === 12 ? 'critical' : null) : null;
    setResult({ dice, sum, outcome });
  }

  const total = result ? result.sum + modifier : null;
  const sign = modifier >= 0 ? '+' : '−';

  return (
    <div className={styles.wrap}>
      {open && (
        <div className={styles.panel} role="dialog" aria-label={t('dice.panelLabel')}>
          <div className={styles.row}>
            {/* Label beside each control via htmlFor, not wrapped around it: wrapping a
                <select> folds every option's text into its accessible name (App.tsx hit
                this with the language picker). */}
            <div className={styles.field}>
              <label htmlFor="dice-count">{t('dice.count')}</label>
              <input
                id="dice-count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(event) => setCount(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
              />
            </div>
            <span className={styles.dLetter}>d</span>
            <div className={styles.field}>
              <label htmlFor="dice-sides">{t('dice.sides')}</label>
              <select id="dice-sides" value={sides} onChange={(event) => setSides(Number(event.target.value))}>
                {DIE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="dice-modifier">{t('dice.modifier')}</label>
              <input
                id="dice-modifier"
                type="number"
                value={modifier}
                onChange={(event) => setModifier(Number(event.target.value) || 0)}
              />
            </div>
          </div>

          <button type="button" onClick={rollDice}>
            {t('dice.roll')}
          </button>

          {result && total !== null && (
            <p className={styles.result} role="status">
              {t('dice.rollResult', { dice: result.dice.join(' + '), sign, modAbs: Math.abs(modifier), total })}
              {result.outcome === 'fumble' && <span className={styles.fumble}> — {t('sheet.rollFumble')}</span>}
              {result.outcome === 'critical' && <span className={styles.critical}> — {t('sheet.rollCritical')}</span>}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-label={t('dice.floatingButton')}
      >
        {t('dice.floatingButtonShort')}
      </button>
    </div>
  );
}
