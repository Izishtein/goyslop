import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DIMINISHERS,
  enemiesFor,
  FEATURE_LIMIT,
  happenedByItself,
  KEYED_LIMIT,
  KEYED_TEMPLATES,
  newKeyedScene,
  TEXT_LIMIT,
  TRIGGERS,
  type KeyedScene,
  type Trigger,
} from '../../lib/keyed';
import { adventureAtom } from '../../state/adventure';
import styles from './SoloView.module.css';

const percentKey = (value: number) => String(Math.round(value * 100));

function statusOf(keyed: KeyedScene) {
  return { count: keyed.count, every: keyed.every, chance: keyed.chance, at: keyed.at };
}

export function AdventurePanel() {
  const { t } = useTranslation();
  const [adventure, setAdventure] = useAtom(adventureAtom);
  const [title, setTitle] = useState('');
  const [trigger, setTrigger] = useState<Trigger>('counter');
  const [every, setEvery] = useState(4);
  const [chance, setChance] = useState(2);
  const [at, setAt] = useState(10);
  const [repeat, setRepeat] = useState(false);
  const [feature, setFeature] = useState('');
  const [enemies, setEnemies] = useState(6);

  function applyTemplate(id: string) {
    const template = KEYED_TEMPLATES.find((entry) => entry.id === id);
    if (!template) return;
    setTitle(t(`solo.adventure.templates.${template.id}`));
    setTrigger(template.trigger);
    setEvery(template.every ?? 3);
    setChance(template.chance ?? 2);
    setAt(template.at ?? 10);
    setRepeat(template.repeat);
  }

  function addKeyed() {
    if (!title.trim() || adventure.keyed.length >= KEYED_LIMIT) return;
    const scene = newKeyedScene({ title, trigger, every, chance, at, repeat }, crypto.randomUUID());
    setAdventure((current) => ({ ...current, keyed: [...current.keyed, scene] }));
    setTitle('');
  }

  function addFeature() {
    const text = feature.trim().slice(0, TEXT_LIMIT);
    if (!text || adventure.features.length >= FEATURE_LIMIT) return;
    setAdventure((current) => ({ ...current, features: [...current.features, text] }));
    setFeature('');
  }

  return (
    <section className={styles.panel} aria-labelledby="solo-adventure">
      <div className={styles.panelHead}>
        <h3 id="solo-adventure">{t('solo.adventure.title')}</h3>
        <p className={styles.note}>{t('solo.adventure.note')}</p>
      </div>

      <div className={styles.toolbar}>
        <label>
          <input
            type="checkbox"
            checked={adventure.prepared}
            onChange={(e) => setAdventure((current) => ({ ...current, prepared: e.target.checked }))}
          />
          {t('solo.adventure.prepared')}
        </label>
      </div>

      <h4>{t('solo.adventure.keyedHead')}</h4>
      <div className={styles.toolbar}>
        <label>
          {t('solo.adventure.template')}
          <select value="" onChange={(e) => applyTemplate(e.target.value)}>
            <option value="">{t('solo.adventure.noTemplate')}</option>
            {KEYED_TEMPLATES.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {t(`solo.adventure.templates.${entry.id}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('solo.adventure.eventTitle')}
          <input type="text" value={title} maxLength={TEXT_LIMIT} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          {t('solo.adventure.trigger')}
          <select value={trigger} onChange={(e) => setTrigger(e.target.value as Trigger)}>
            {TRIGGERS.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.adventure.triggers.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        {trigger === 'counter' && (
          <label>
            {t('solo.adventure.every')}
            <input type="number" min={1} max={99} value={every} onChange={(e) => setEvery(Number(e.target.value))} />
          </label>
        )}
        {trigger !== 'counter' && (
          <label>
            {t('solo.adventure.chance')}
            <input type="number" min={1} max={10} value={chance} onChange={(e) => setChance(Number(e.target.value))} />
          </label>
        )}
        {trigger === 'milestone' && (
          <label>
            {t('solo.adventure.at')}
            <input type="number" min={1} max={999} value={at} onChange={(e) => setAt(Number(e.target.value))} />
          </label>
        )}
        <label>
          <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
          {t('solo.adventure.repeat')}
        </label>
        <button type="button" onClick={addKeyed} disabled={!title.trim()}>
          {t('solo.adventure.add')}
        </button>
      </div>

      {adventure.keyed.length === 0 ? (
        <p className={styles.note}>{t('solo.adventure.empty')}</p>
      ) : (
        <ul className={styles.oracleLog} aria-label={t('solo.adventure.keyedHead')}>
          {adventure.keyed.map((keyed) => (
            <li key={keyed.id}>
              <p>
                <strong style={keyed.done ? { textDecoration: 'line-through' } : undefined}>{keyed.title}</strong> ·{' '}
                {keyed.done ? t('solo.adventure.done') : t(`solo.adventure.status.${keyed.trigger}`, statusOf(keyed))}
              </p>
              <div className={styles.controls}>
                {!keyed.done && (
                  <button
                    type="button"
                    onClick={() => setAdventure((current) => ({ ...current, keyed: happenedByItself(current.keyed, keyed.id) }))}
                  >
                    {t('solo.adventure.ownAccord')}
                  </button>
                )}
                <button
                  type="button"
                  aria-label={t('solo.adventure.remove', { title: keyed.title })}
                  onClick={() => setAdventure((current) => ({ ...current, keyed: current.keyed.filter((entry) => entry.id !== keyed.id) }))}
                >
                  {t('solo.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adventure.prepared && (
        <>
          <h4>{t('solo.adventure.featuresHead')}</h4>
          <p className={styles.note}>{t('solo.adventure.featuresNote')}</p>
          <div className={styles.toolbar}>
            <label>
              {t('solo.adventure.featureLabel')}
              <input type="text" value={feature} maxLength={TEXT_LIMIT} onChange={(e) => setFeature(e.target.value)} />
            </label>
            <button type="button" onClick={addFeature} disabled={!feature.trim()}>
              {t('solo.adventure.addFeature')}
            </button>
          </div>
          {adventure.features.length === 0 ? (
            <p className={styles.note}>{t('solo.adventure.noFeatures')}</p>
          ) : (
            <ul className={styles.oracleLog} aria-label={t('solo.adventure.featuresHead')}>
              {adventure.features.map((text, index) => (
                <li key={`${index}-${text}`}>
                  <p>{text}</p>
                  <div className={styles.controls}>
                    <button
                      type="button"
                      aria-label={t('solo.adventure.removeFeature', { text })}
                      onClick={() => setAdventure((current) => ({ ...current, features: current.features.filter((_, i) => i !== index) }))}
                    >
                      {t('solo.remove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h4>{t('solo.adventure.diminisher')}</h4>
          <div className={styles.toolbar}>
            <label>
              {t('solo.adventure.diminisherLabel')}
              <select
                value={adventure.diminisher}
                onChange={(e) => setAdventure((current) => ({ ...current, diminisher: Number(e.target.value) }))}
              >
                {DIMINISHERS.map((value) => (
                  <option key={value} value={value}>
                    {t(`solo.adventure.diminisherOptions.${percentKey(value)}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('solo.adventure.enemies')}
              <input type="number" min={1} max={99} value={enemies} onChange={(e) => setEnemies(Number(e.target.value))} />
            </label>
            <span className={styles.numeric}>{t('solo.adventure.keep', { count: enemiesFor(enemies, adventure.diminisher) })}</span>
          </div>
        </>
      )}
    </section>
  );
}
