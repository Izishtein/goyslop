import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tableTargets } from '../../lib/encounter';
import { resolveAttackSequence, snipeDoubles, type AttackPass, type AttackSequence } from '../../lib/player-attack';
import { encounterAtom } from '../../state/encounter';
import { useMonsters } from '../solo/useMonsters';
import { FumbleXpButton } from './FumbleXp';
import { WeaponDamageRoll, type DamageOptions } from './WeaponDamageRoll';
import styles from './AttackPanel.module.css';

export interface PanelWeapon {
  id: string;
  label: string;
  accuracy: number;
  power: number;
  criticalValue: number;
  extraDamage: number;
}

interface Played {
  id: number;
  weaponId: string;
  sequence: AttackSequence;
}

/**
 * A weapon attack played against the monsters on the table: one Accuracy check (2d6 + Total Accuracy)
 * set against each chosen target's Evasion. [Cleave] reaches 3 or 5 targets on that single check;
 * [Repeated Strike] gives those who evaded one more check; each hit gets its own damage roll,
 * with [Snipe]'s doubling and [Repeated Strike II]'s +4 read off the result.
 */
export function AttackPanel({
  weapons,
  options,
  targetLimit,
  repeated,
}: {
  weapons: PanelWeapon[];
  options: DamageOptions;
  targetLimit: 1 | 3 | 5;
  repeated: boolean;
}) {
  const { t } = useTranslation();
  const encounter = useAtomValue(encounterAtom);
  const { byId } = useMonsters();
  const targets = tableTargets(encounter, byId);
  const [weaponId, setWeaponId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [fixed, setFixed] = useState(false);
  const [played, setPlayed] = useState<Played | null>(null);

  if (targets.length === 0 || weapons.length === 0) return null;

  const weapon = weapons.find((entry) => entry.id === weaponId) ?? weapons[0];
  const chosen = targets.filter((target) => selected.includes(target.key)).slice(0, targetLimit);
  const labelOf = (key: string) => targets.find((target) => target.key === key)?.label ?? key;
  const playedWeapon = played ? (weapons.find((entry) => entry.id === played.weaponId) ?? weapon) : weapon;

  function toggle(key: string) {
    setSelected((current) => {
      if (current.includes(key)) return current.filter((entry) => entry !== key);
      return targetLimit === 1 ? [key] : [...current, key];
    });
  }

  function attack() {
    const sequence = resolveAttackSequence(weapon.accuracy, chosen, { fixed, repeated });
    setPlayed({ id: (played?.id ?? 0) + 1, weaponId: weapon.id, sequence });
  }

  function renderPass(pass: AttackPass) {
    const { attack: roll } = pass;
    const sign = playedWeapon.accuracy >= 0 ? '+' : '−';
    return (
      <span className={styles.pass}>
        <span>
          {t('sheet.attackPanel.accuracyLine', { d1: roll.dice[0], d2: roll.dice[1], sign, mod: Math.abs(playedWeapon.accuracy), value: roll.successValue })}
          {roll.outcome === 'fumble' && (
            <span className={styles.fumble}>
              {' '}
              — {t('sheet.attackPanel.fumble')} <FumbleXpButton roll={roll} />
            </span>
          )}
          {roll.outcome === 'critical' && <span className={styles.hit}> — {t('sheet.attackPanel.critical')}</span>}
        </span>
        {pass.outcomes.map((outcome) => (
          <span key={outcome.key}>
            {t('sheet.attackPanel.targetLine', { name: labelOf(outcome.key), evasion: outcome.evasion.value })}{' '}
            <span className={outcome.hit ? styles.hit : styles.miss}>{outcome.hit ? t('sheet.attackPanel.hit', { margin: outcome.margin }) : t('sheet.attackPanel.evaded')}</span>
          </span>
        ))}
      </span>
    );
  }

  const firstBonusKey = played?.sequence.hits.find((hit) => hit.onFirst)?.key;

  return (
    <div className={styles.panel} role="group" aria-label={t('sheet.attackPanel.title')}>
      <h5 className={styles.title}>{t('sheet.attackPanel.title')}</h5>
      <div className={styles.controls}>
        {weapons.length > 1 && (
          <label>
            {t('sheet.attackPanel.weapon')}{' '}
            <select value={weapon.id} onChange={(event) => setWeaponId(event.target.value)}>
              {weapons.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          <input type="checkbox" checked={fixed} onChange={(event) => setFixed(event.target.checked)} /> {t('sheet.attackPanel.fixed')}
        </label>
        <button type="button" onClick={attack} disabled={chosen.length === 0}>
          {t('sheet.attackPanel.attack')}
        </button>
      </div>
      <fieldset className={styles.targets}>
        <legend>{t('sheet.attackPanel.targets', { max: targetLimit })}</legend>
        {targets.map((target) => {
          const on = chosen.some((entry) => entry.key === target.key);
          return (
            <label key={target.key}>
              <input type="checkbox" checked={on} disabled={!on && targetLimit > 1 && chosen.length >= targetLimit} onChange={() => toggle(target.key)} /> {target.label}
            </label>
          );
        })}
      </fieldset>
      {played && (
        <div role="status" className={styles.pass}>
          {renderPass(played.sequence.first)}
          {played.sequence.second && (
            <>
              <strong>{t('sheet.attackPanel.secondPass')}</strong>
              {renderPass(played.sequence.second)}
            </>
          )}
          {played.sequence.hits.length === 0 && <span className={styles.miss}>{t('sheet.attackPanel.noHits')}</span>}
          {played.sequence.hits.map((hit) => (
            <span key={`${played.id}:${hit.key}`} className={styles.damage}>
              {t('sheet.attackPanel.damageFor', { name: labelOf(hit.key) })}
              <WeaponDamageRoll
                power={playedWeapon.power}
                criticalValue={playedWeapon.criticalValue}
                extraDamage={playedWeapon.extraDamage}
                label={`${playedWeapon.label} → ${labelOf(hit.key)}`}
                options={{
                  ...options,
                  presetTarget: hit.key,
                  snipeAuto: options.snipe ? snipeDoubles(hit.margin) : undefined,
                  firstHitAuto: options.repeatedStrikeII ? hit.key === firstBonusKey : undefined,
                }}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
