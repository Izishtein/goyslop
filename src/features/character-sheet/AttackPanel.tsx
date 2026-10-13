import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tableTargets } from '../../lib/encounter';
import { resolveAttackSequence, rollAccuracy, snipeDoubles, strayTarget, type AttackPass, type AttackSequence } from '../../lib/player-attack';
import { encounterAtom } from '../../state/encounter';
import { useMonsters } from '../solo/useMonsters';
import { FumbleXpButton } from './FumbleXp';
import { WeaponDamageRoll, type DamageOptions } from './WeaponDamageRoll';
import styles from './AttackPanel.module.css';

export interface PanelWeapon {
  id: string;
  label: string;
  /** Total Accuracy, before any [Dual Wielding] penalty (the panel takes that off itself). */
  accuracy: number;
  power: number;
  criticalValue: number;
  extraDamage: number;
  bludgeoning?: boolean;
  /** A bow, crossbow, gun or thrown weapon: aimed into a skirmish from outside, the shot can stray. */
  ranged?: boolean;
}

/** [Dual Wielding] is on: two attacks in one Major Action, one with each hand, each at -`penalty` Accuracy. */
export interface DualWield {
  penalty: number;
  /** [Twin Strike]: the second attack's target is chosen after seeing the first. */
  twinStrike: boolean;
}

/** Where a stray shot went: to the enemy it picked, or onto an ally in the skirmish. */
type Stray = { ally: false; key: string } | { ally: true };

interface Strike {
  weaponId: string;
  /** The Accuracy the check was made with (the penalty of two-handed fighting already off). */
  accuracy: number;
  sequence: AttackSequence;
  stray: Stray | null;
}

interface Played {
  id: number;
  strikes: Strike[];
}

/**
 * A weapon attack played against the monsters on the table: one Accuracy check (2d6 + Total Accuracy)
 * set against each chosen target's Evasion. [Cleave] reaches 3 or 5 targets on that single check;
 * [Repeated Strike] gives those who evaded one more check; each hit gets its own damage roll,
 * with [Snipe]'s doubling and [Repeated Strike II]'s +4 read off the result. With [Dual Wielding] there are
 * two attacks, one per hand, each at -2 ([Dual Technique] lifts that; [Twin Strike] lets the second pick its target
 * after the first). A ranged weapon aimed into a skirmish from outside strays (CR I p. 128) unless [Targeting].
 */
export function AttackPanel({
  weapons,
  options,
  targetLimit,
  repeated,
  dual,
  targeting = false,
}: {
  weapons: PanelWeapon[];
  options: DamageOptions;
  targetLimit: 1 | 3 | 5;
  repeated: boolean;
  dual?: DualWield;
  /** The character has [Targeting] (or the like): shots never stray. */
  targeting?: boolean;
}) {
  const { t } = useTranslation();
  const encounter = useAtomValue(encounterAtom);
  const { byId } = useMonsters();
  const targets = tableTargets(encounter, byId);
  const [weaponId, setWeaponId] = useState('');
  const [offHandId, setOffHandId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [secondSelected, setSecondSelected] = useState<string[] | null>(null);
  const [fixed, setFixed] = useState(false);
  const [intoSkirmish, setIntoSkirmish] = useState(false);
  const [allies, setAllies] = useState(0);
  const [played, setPlayed] = useState<Played | null>(null);

  if (targets.length === 0 || weapons.length === 0) return null;

  const weapon = weapons.find((entry) => entry.id === weaponId) ?? weapons[0];
  const offHand = weapons.find((entry) => entry.id === offHandId) ?? weapons[1] ?? weapons[0];
  const strays = (entry: PanelWeapon) => intoSkirmish && !targeting && entry.ranged === true;
  /** The shots go where the dice say, so the checked targets are the skirmish's whole crowd. */
  const limit = strays(weapon) ? targets.length : targetLimit;
  const chosen = targets.filter((target) => selected.includes(target.key)).slice(0, limit);
  const labelOf = (key: string) => targets.find((target) => target.key === key)?.label ?? key;
  const weaponOf = (id: string) => weapons.find((entry) => entry.id === id) ?? weapon;
  const penalty = dual?.penalty ?? 0;
  const secondChosen = targets.filter((target) => (secondSelected ?? selected).includes(target.key)).slice(0, targetLimit);
  const waitingForSecond = !!dual?.twinStrike && played !== null && played.strikes.length === 1;

  function toggle(key: string) {
    setSelected((current) => {
      if (current.includes(key)) return current.filter((entry) => entry !== key);
      return limit === 1 ? [key] : [...current, key];
    });
  }

  function toggleSecond(key: string) {
    setSecondSelected((current) => {
      const base = current ?? selected;
      if (base.includes(key)) return base.filter((entry) => entry !== key);
      return targetLimit === 1 ? [key] : [...base, key];
    });
  }

  /** One attack with one weapon: stray shots first pick who is really shot at, then the Accuracy check is made. */
  function strike(entry: PanelWeapon, aimedAt: typeof chosen): Strike {
    const accuracy = entry.accuracy - penalty;
    if (strays(entry)) {
      const index = strayTarget(aimedAt.length, allies);
      if (index === null) return { weaponId: entry.id, accuracy, sequence: { first: { attack: rollAccuracy(accuracy), outcomes: [] }, second: null, hits: [] }, stray: { ally: true } };
      const victim = aimedAt[index];
      return { weaponId: entry.id, accuracy, sequence: resolveAttackSequence(accuracy, [victim], { fixed, repeated }), stray: { ally: false, key: victim.key } };
    }
    return { weaponId: entry.id, accuracy, sequence: resolveAttackSequence(accuracy, aimedAt, { fixed, repeated }), stray: null };
  }

  function attack() {
    const first = strike(weapon, chosen);
    const strikes = dual && !dual.twinStrike ? [first, strike(offHand, chosen)] : [first];
    setSecondSelected(null);
    setPlayed({ id: (played?.id ?? 0) + 1, strikes });
  }

  function attackSecond() {
    if (!played) return;
    setPlayed({ ...played, strikes: [...played.strikes, strike(offHand, secondChosen)] });
  }

  function renderPass(pass: AttackPass, accuracy: number) {
    const { attack: roll } = pass;
    const sign = accuracy >= 0 ? '+' : '−';
    return (
      <span className={styles.pass}>
        <span>
          {t('sheet.attackPanel.accuracyLine', { d1: roll.dice[0], d2: roll.dice[1], sign, mod: Math.abs(accuracy), value: roll.successValue })}
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

  function renderStrike(entry: Strike, index: number, playedId: number) {
    const used = weaponOf(entry.weaponId);
    const firstBonusKey = entry.sequence.hits.find((hit) => hit.onFirst)?.key;
    return (
      <span key={index} className={styles.pass}>
        {dual && (
          <strong>
            {t(index === 0 ? 'sheet.attackPanel.mainHand' : 'sheet.attackPanel.offHand')}: {used.label}
          </strong>
        )}
        {entry.stray && <span className={styles.miss}>{entry.stray.ally ? t('sheet.attackPanel.strayAlly') : t('sheet.attackPanel.strayTo', { name: labelOf(entry.stray.key) })}</span>}
        {renderPass(entry.sequence.first, entry.accuracy)}
        {entry.sequence.second && (
          <>
            <strong>{t('sheet.attackPanel.secondPass')}</strong>
            {renderPass(entry.sequence.second, entry.accuracy)}
          </>
        )}
        {entry.sequence.hits.length === 0 && !entry.stray?.ally && <span className={styles.miss}>{t('sheet.attackPanel.noHits')}</span>}
        {entry.sequence.hits.map((hit) => (
          <span key={`${playedId}:${index}:${hit.key}`} className={styles.damage}>
            {t('sheet.attackPanel.damageFor', { name: labelOf(hit.key) })}
            <WeaponDamageRoll
              power={used.power}
              criticalValue={used.criticalValue}
              extraDamage={used.extraDamage}
              label={`${used.label} → ${labelOf(hit.key)}`}
              options={{
                ...options,
                presetTarget: hit.key,
                bludgeoning: used.bludgeoning,
                snipeAuto: options.snipe ? snipeDoubles(hit.margin) : undefined,
                firstHitAuto: options.repeatedStrikeII ? hit.key === firstBonusKey : undefined,
              }}
            />
          </span>
        ))}
      </span>
    );
  }

  const weaponSelect = (value: string, onChange: (id: string) => void, label: string) => (
    <label>
      {label}{' '}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {weapons.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className={styles.panel} role="group" aria-label={t('sheet.attackPanel.title')}>
      <h5 className={styles.title}>{t('sheet.attackPanel.title')}</h5>
      <div className={styles.controls}>
        {dual
          ? weaponSelect(weapon.id, setWeaponId, t('sheet.attackPanel.mainHand'))
          : weapons.length > 1 && weaponSelect(weapon.id, setWeaponId, t('sheet.attackPanel.weapon'))}
        {dual && weaponSelect(offHand.id, setOffHandId, t('sheet.attackPanel.offHand'))}
        <label>
          <input type="checkbox" checked={fixed} onChange={(event) => setFixed(event.target.checked)} /> {t('sheet.attackPanel.fixed')}
        </label>
        {!targeting && (weapon.ranged || (dual && offHand.ranged)) && (
          <>
            <label>
              <input type="checkbox" checked={intoSkirmish} onChange={(event) => setIntoSkirmish(event.target.checked)} /> {t('sheet.attackPanel.intoSkirmish')}
            </label>
            {intoSkirmish && (
              <label>
                {t('sheet.attackPanel.alliesInSkirmish')}{' '}
                <input type="number" min={0} max={9} value={allies} onChange={(event) => setAllies(Math.max(0, Math.min(9, Number(event.target.value) || 0)))} />
              </label>
            )}
          </>
        )}
        <button type="button" onClick={attack} disabled={chosen.length === 0}>
          {dual ? t('sheet.attackPanel.attackDual', { penalty }) : t('sheet.attackPanel.attack')}
        </button>
      </div>
      <fieldset className={styles.targets}>
        <legend>{strays(weapon) ? t('sheet.attackPanel.skirmishTargets') : t('sheet.attackPanel.targets', { max: limit })}</legend>
        {targets.map((target) => {
          const on = chosen.some((entry) => entry.key === target.key);
          return (
            <label key={target.key}>
              <input type="checkbox" checked={on} disabled={!on && limit > 1 && chosen.length >= limit} onChange={() => toggle(target.key)} /> {target.label}
            </label>
          );
        })}
      </fieldset>
      {played && (
        <div role="status" className={styles.pass}>
          {played.strikes.map((entry, index) => renderStrike(entry, index, played.id))}
        </div>
      )}
      {waitingForSecond && (
        <fieldset className={styles.targets}>
          <legend>{t('sheet.attackPanel.secondTargets')}</legend>
          {targets.map((target) => (
            <label key={target.key}>
              <input type="checkbox" checked={secondChosen.some((entry) => entry.key === target.key)} onChange={() => toggleSecond(target.key)} /> {target.label}
            </label>
          ))}
          <button type="button" onClick={attackSecond} disabled={secondChosen.length === 0}>
            {t('sheet.attackPanel.attackSecond', { name: offHand.label })}
          </button>
        </fieldset>
      )}
    </div>
  );
}
