import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { hpFillClass, percent } from './vitals';
import styles from './CharacterSheetView.module.css';

type Pool = { current: number; max: number };

/**
 * The HP/MP editor, opened from the compact gauges in the header.
 *
 * The header keeps the read-at-a-glance bars; the typing happens here, where there is room
 * for what actually gets done at the table — a damage or healing number applied to the
 * current value, rather than mental arithmetic into a four-character input.
 *
 * Clamping stays in CharacterSheetView (one place that knows both maxima), so this panel
 * only ever asks for a new absolute value.
 */
export function HpMpPanel({
  hp,
  mp,
  onChange,
}: {
  hp: Pool;
  mp: Pool;
  onChange: (field: 'hp' | 'mp', value: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-labelledby="section-vitals">
      <div className={styles.sectionHead}>
        <h3 id="section-vitals">{t('sheet.vitalsPanel')}</h3>
      </div>

      <Gauge field="hp" label={t('sheet.hp')} pool={hp} onChange={onChange} fill={hpFillClass(hp.current, hp.max)} />
      <Gauge field="mp" label={t('sheet.mp')} pool={mp} onChange={onChange} fill={styles.mpFill} />
    </section>
  );
}

function Gauge({
  field,
  label,
  pool,
  fill,
  onChange,
}: {
  field: 'hp' | 'mp';
  label: string;
  pool: Pool;
  fill: string;
  onChange: (field: 'hp' | 'mp', value: number) => void;
}) {
  const { t } = useTranslation();
  /* Per gauge, not shared: a round often costs HP and MP at once, and one field would make
     the player retype the second number. */
  const [amount, setAmount] = useState('');
  const step = Number(amount) || 0;

  return (
    <div className={styles.poolRow}>
      <div className={styles.gauge}>
        <div className={styles.gaugeHead}>
          <span className={styles.gaugeLabel}>{label}</span>
          <span className={styles.gaugeValue}>
            <input
              type="number"
              value={pool.current}
              onChange={(event) => onChange(field, Number(event.target.value))}
              aria-label={label}
            />
            <span className={styles.gaugeMax}>/ {pool.max}</span>
            <button type="button" onClick={() => onChange(field, pool.max)} title={t('sheet.resetToMax')}>
              {t('sheet.resetToMaxShort')}
            </button>
          </span>
        </div>
        <div className={styles.track}>
          <div className={`${styles.fill} ${fill}`} style={{ width: percent(pool.current, pool.max) }} />
        </div>
      </div>

      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        <label className={styles.stepField}>
          <span>{t('sheet.amount')}</span>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-label={`${label} ${t('sheet.amount')}`}
          />
        </label>
        <button
          type="button"
          disabled={step === 0}
          onClick={() => onChange(field, pool.current - step)}
          aria-label={`${label} ${t('sheet.subtract')}`}
        >
          − {t('sheet.subtract')}
        </button>
        <button
          type="button"
          disabled={step === 0}
          onClick={() => onChange(field, pool.current + step)}
          aria-label={`${label} ${t('sheet.add')}`}
        >
          + {t('sheet.add')}
        </button>
      </div>
    </div>
  );
}
