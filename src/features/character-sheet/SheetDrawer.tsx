import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CharacterSheetView.module.css';

/**
 * A panel that floats over the sheet on screen and flows inline with it on paper.
 *
 * Its children are mounted whether it is open or not, and closing is a CSS `display: none`
 * rather than unmounting. Two reasons, both learned from the rest of the sheet: printing is
 * expected to yield every field the character has (`@media print` turns this back into a
 * plain block — see CharacterSheetView.module.css), and a half-typed status effect or note
 * must survive closing the panel the same way a collapsed <details> keeps its contents.
 *
 * `printable = false` is for panels that only repeat what the sheet already prints
 * elsewhere (the HP/MP editor duplicates the header's gauges) — on screen they are a
 * convenience, on paper they would be a second copy of the same numbers.
 */
export function SheetDrawer({
  open,
  label,
  onClose,
  printable = true,
  children,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  printable?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  /* Escape closes, and opening moves focus into the panel — without it the keyboard stays
     back on the button that opened this, which is behind the backdrop. */
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={styles.drawer}
      data-open={open ? '' : undefined}
      data-print={printable ? undefined : 'hide'}
    >
      <div className={styles.drawerBackdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawerPanel} role="dialog" aria-label={label} tabIndex={-1} ref={panelRef}>
        {/* No title of its own: every panel's child opens with its own section heading, and
            a second copy of it right above only ate vertical space. */}
        <div className={styles.drawerHead}>
          <button type="button" onClick={onClose}>
            {t('sheet.closePanel')}
          </button>
        </div>
        <div className={styles.drawerBody}>{children}</div>
      </div>
    </div>
  );
}
