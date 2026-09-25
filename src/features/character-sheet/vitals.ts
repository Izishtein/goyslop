import styles from './CharacterSheetView.module.css';

/** HP bar colour doubles as an at-a-glance danger read. */
export function hpFillClass(current: number, max: number): string {
  const ratio = max > 0 ? current / max : 0;
  if (ratio > 0.5) return styles.hpOk;
  if (ratio > 0.25) return styles.hpWarn;
  return styles.hpDanger;
}

export function percent(current: number, max: number): string {
  if (max <= 0) return '0%';
  return `${Math.max(0, Math.min(100, (current / max) * 100))}%`;
}
