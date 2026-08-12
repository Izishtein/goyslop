import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tickStatusEffects } from '../../lib/formulas/status-effects';
import {
  STATUS_EFFECT_FIELDS,
  type Character,
  type StatusEffect,
  type StatusEffectDuration,
  type StatusEffectField,
  type StatusEffectModifier,
} from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import styles from './CharacterSheetView.module.css';

type DurationKind = StatusEffectDuration['kind'];

function describeDuration(duration: StatusEffectDuration, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (duration.kind === 'rounds') return t('statusEffects.roundsLeft', { count: duration.remaining });
  if (duration.kind === 'permanent') return t('statusEffects.permanent');
  return t('statusEffects.untilRemoved');
}

function describeModifier(modifier: StatusEffectModifier, t: (key: string) => string): string {
  const label = modifier.field === 'custom' ? modifier.customLabel || t('statusEffects.custom') : t(`statusEffects.field.${modifier.field}`);
  const sign = modifier.value >= 0 ? '+' : '';
  return `${label} ${sign}${modifier.value}`;
}

interface DraftModifier {
  field: StatusEffectField;
  customLabel: string;
  value: number;
}

function emptyDraft(): DraftModifier {
  return { field: 'accuracy', customLabel: '', value: -1 };
}

export function StatusEffectsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [durationKind, setDurationKind] = useState<DurationKind>('rounds');
  const [rounds, setRounds] = useState(1);
  const [modifiers, setModifiers] = useState<DraftModifier[]>([emptyDraft()]);

  function addModifierRow() {
    setModifiers((prev) => [...prev, emptyDraft()]);
  }
  function removeModifierRow(index: number) {
    setModifiers((prev) => prev.filter((_, i) => i !== index));
  }
  function updateModifierRow(index: number, patch: Partial<DraftModifier>) {
    setModifiers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function resetForm() {
    setName('');
    setSource('');
    setDurationKind('rounds');
    setRounds(1);
    setModifiers([emptyDraft()]);
  }

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    const duration: StatusEffectDuration = durationKind === 'rounds' ? { kind: 'rounds', remaining: rounds } : { kind: durationKind };

    const effect: StatusEffect = {
      id: crypto.randomUUID(),
      name: name.trim(),
      source: source.trim() || undefined,
      duration,
      modifiers: modifiers.map((m) => ({
        field: m.field,
        customLabel: m.field === 'custom' ? m.customLabel.trim() || undefined : undefined,
        value: m.value,
      })),
    };

    update((c) => ({ ...c, statusEffects: [...c.statusEffects, effect] }));
    resetForm();
  }

  function removeEffect(id: string) {
    update((c) => ({ ...c, statusEffects: c.statusEffects.filter((e) => e.id !== id) }));
  }

  function nextRound() {
    update((c) => ({ ...c, statusEffects: tickStatusEffects(c.statusEffects) }));
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3>{t('statusEffects.title')}</h3>
        {character.statusEffects.length > 0 && (
          <button type="button" onClick={nextRound}>
            {t('statusEffects.nextRound')}
          </button>
        )}
      </div>

      {character.statusEffects.length === 0 ? (
        <p className={styles.empty}>{t('sheet.noStatusEffects')}</p>
      ) : (
        <ul className={styles.effectList}>
          {character.statusEffects.map((effect) => (
            <li key={effect.id} className={styles.effect}>
              <span className={styles.effectName}>{effect.name}</span>
              {effect.source && <span className={styles.effectMeta}>{effect.source}</span>}
              <span className={styles.effectMeta}>{describeDuration(effect.duration, t)}</span>
              <span className={styles.effectMods}>
                {effect.modifiers.map((modifier, index) => (
                  <span key={index} className={styles.modChip}>
                    {describeModifier(modifier, t)}
                  </span>
                ))}
              </span>
              <span className={styles.effectSpacer} />
              <button type="button" onClick={() => removeEffect(effect.id)}>
                {t('sheet.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className={styles.effectForm}>
        <h4>{t('statusEffects.addTitle')}</h4>

        <div className={styles.formRow}>
          <div className={styles.field}>
            <label htmlFor="effect-name">{t('statusEffects.name')}</label>
            <input id="effect-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="effect-source">{t('statusEffects.source')}</label>
            <input id="effect-source" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="effect-duration">{t('statusEffects.duration')}</label>
            <select id="effect-duration" value={durationKind} onChange={(e) => setDurationKind(e.target.value as DurationKind)}>
              <option value="rounds">{t('statusEffects.rounds')}</option>
              <option value="permanent">{t('statusEffects.permanent')}</option>
              <option value="untilRemoved">{t('statusEffects.untilRemoved')}</option>
            </select>
          </div>
          {durationKind === 'rounds' && (
            <div className={styles.field}>
              <label htmlFor="effect-rounds">{t('statusEffects.rounds')}</label>
              <input id="effect-rounds" type="number" min={1} value={rounds} onChange={(e) => setRounds(Number(e.target.value))} />
            </div>
          )}
        </div>

        {modifiers.map((modifier, index) => (
          <div key={index} className={styles.formRow}>
            <div className={styles.field}>
              <label htmlFor={`modifier-field-${index}`}>{t('statusEffects.modifierField')}</label>
              <select
                id={`modifier-field-${index}`}
                value={modifier.field}
                onChange={(e) => updateModifierRow(index, { field: e.target.value as StatusEffectField })}
                aria-label={t('statusEffects.modifierField')}
              >
                {STATUS_EFFECT_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {t(`statusEffects.field.${field}`)}
                  </option>
                ))}
              </select>
            </div>

            {modifier.field === 'custom' && (
              <div className={styles.field}>
                <label htmlFor={`modifier-label-${index}`}>{t('statusEffects.custom')}</label>
                <input
                  id={`modifier-label-${index}`}
                  value={modifier.customLabel}
                  onChange={(e) => updateModifierRow(index, { customLabel: e.target.value })}
                  aria-label={t('statusEffects.custom')}
                />
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor={`modifier-value-${index}`}>{t('statusEffects.modifierValue')}</label>
              <input
                id={`modifier-value-${index}`}
                type="number"
                value={modifier.value}
                onChange={(e) => updateModifierRow(index, { value: Number(e.target.value) })}
                aria-label={t('statusEffects.modifierValue')}
              />
            </div>

            <button type="button" onClick={() => removeModifierRow(index)} disabled={modifiers.length === 1}>
              {t('sheet.remove')}
            </button>
          </div>
        ))}

        <div className={styles.formActions}>
          <button type="button" onClick={addModifierRow}>
            {t('statusEffects.addModifier')}
          </button>
          <button type="submit">{t('statusEffects.addEffect')}</button>
        </div>
      </form>
    </section>
  );
}
