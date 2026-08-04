import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tickStatusEffects } from '../../lib/formulas/status-effects';
import { STATUS_EFFECT_FIELDS, type Character, type StatusEffect, type StatusEffectDuration, type StatusEffectField, type StatusEffectModifier } from '../../types/character';
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

export function StatusEffectsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [durationKind, setDurationKind] = useState<DurationKind>('rounds');
  const [rounds, setRounds] = useState(1);
  const [modifiers, setModifiers] = useState<DraftModifier[]>([{ field: 'accuracy', customLabel: '', value: -1 }]);

  function addModifierRow() {
    setModifiers((prev) => [...prev, { field: 'accuracy', customLabel: '', value: -1 }]);
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
    setModifiers([{ field: 'accuracy', customLabel: '', value: -1 }]);
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
    <section>
      <h3>{t('statusEffects.title')}</h3>

      {character.statusEffects.length === 0 ? (
        <p>{t('sheet.noStatusEffects')}</p>
      ) : (
        <>
          <ul className={styles.classList}>
            {character.statusEffects.map((effect) => (
              <li key={effect.id}>
                <strong>{effect.name}</strong>
                {effect.source ? ` (${effect.source})` : ''} — {describeDuration(effect.duration, t)}
                {effect.modifiers.length > 0 && `: ${effect.modifiers.map((m) => describeModifier(m, t)).join(', ')}`}{' '}
                <button type="button" onClick={() => removeEffect(effect.id)}>
                  {t('sheet.remove')}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={nextRound}>
            {t('statusEffects.nextRound')}
          </button>
        </>
      )}

      <form onSubmit={handleAdd} className={styles.sheet}>
        <h4>{t('statusEffects.addTitle')}</h4>
        <div className={styles.trackers}>
          <div>
            <label htmlFor="effect-name">{t('statusEffects.name')}</label>
            <input id="effect-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="effect-source">{t('statusEffects.source')}</label>
            <input id="effect-source" value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div>
            <label htmlFor="effect-duration">{t('statusEffects.duration')}</label>
            <select id="effect-duration" value={durationKind} onChange={(e) => setDurationKind(e.target.value as DurationKind)}>
              <option value="rounds">{t('statusEffects.rounds')}</option>
              <option value="permanent">{t('statusEffects.permanent')}</option>
              <option value="untilRemoved">{t('statusEffects.untilRemoved')}</option>
            </select>
          </div>
          {durationKind === 'rounds' && (
            <div>
              <label htmlFor="effect-rounds">{t('statusEffects.rounds')}</label>
              <input id="effect-rounds" type="number" min={1} value={rounds} onChange={(e) => setRounds(Number(e.target.value))} />
            </div>
          )}
        </div>

        <table className={styles.abilityTable}>
          <thead>
            <tr>
              <th>{t('sheet.name')}</th>
              <th>{t('statusEffects.modifierField')}</th>
              <th>{t('statusEffects.modifierValue')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {modifiers.map((modifier, index) => (
              <tr key={index}>
                <td>
                  {modifier.field === 'custom' && (
                    <input
                      value={modifier.customLabel}
                      onChange={(e) => updateModifierRow(index, { customLabel: e.target.value })}
                      placeholder={t('statusEffects.custom')}
                      aria-label={t('statusEffects.custom')}
                    />
                  )}
                </td>
                <td>
                  <select
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
                </td>
                <td>
                  <input
                    type="number"
                    value={modifier.value}
                    onChange={(e) => updateModifierRow(index, { value: Number(e.target.value) })}
                    aria-label={t('statusEffects.modifierValue')}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => removeModifierRow(index)} disabled={modifiers.length === 1}>
                    {t('sheet.remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addModifierRow}>
          {t('statusEffects.addModifier')}
        </button>

        <button type="submit">{t('statusEffects.addEffect')}</button>
      </form>
    </section>
  );
}
