import type { InputHTMLAttributes } from 'react';
import styles from './CharacterSheetView.module.css';

/**
 * A text field that survives printing.
 *
 * An `<input>` draws a single unwrappable line, so inside the fixed-layout tables of the
 * printed sheet a long value is cut off at the cell edge — a note the player typed simply
 * missing from the paper, with nothing to show it was ever there. This pairs the editable
 * field with a print-only copy of the same text, which wraps inside the cell.
 *
 * Only for free text. Numbers, ranks and selects are short by construction and print as
 * they are.
 */
export function PrintableField({ value, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> & { value: string }) {
  return (
    <>
      <input className={styles.screenField} value={value} {...props} />
      {/* aria-hidden: the input above already carries this text for assistive tech. */}
      <span className={styles.printValue} aria-hidden="true">
        {value}
      </span>
    </>
  );
}
