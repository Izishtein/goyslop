import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValuePair } from '../../data/monsters';
import { isDown, rollEvasion, type EvasionRoll } from '../../lib/encounter';
import { spellMagicPower } from '../../lib/spellcasting';
import { rollSpellcastingCheck, spellResisted, type SpellcastingCheck } from '../../lib/spell-check';
import { encounterAtom } from '../../state/encounter';
import type { Character } from '../../types/character';
import { useMonsters } from '../solo/useMonsters';
import { FumbleXpButton } from './FumbleXp';
import styles from './DiceRoll.module.css';

/**
 * A spell with no Power to roll — a binding, a curse, a charm — still has a Spellcasting check, and its target may
 * resist it with Willpower (CR I pp. 110, 169–170). The catalogue does not keep a spell's kind of resistance, so the
 * verdict is worded for both: "Resistance: Neg" cancels the effect, "Half" weakens it (read the spell's own text).
 */
export function SpellResistRoll({ character, school }: { character: Character; school: string }) {
  const { t } = useTranslation();
  const encounter = useAtomValue(encounterAtom);
  const { byId } = useMonsters();
  const bonus = spellMagicPower(character, school);
  const [check, setCheck] = useState<SpellcastingCheck | null>(null);
  const [choice, setChoice] = useState('');
  const [fixed, setFixed] = useState(false);
  const [save, setSave] = useState<EvasionRoll | null>(null);

  const targets = encounter.monsters.filter((instance) => byId.has(instance.monsterId) && !instance.sections.every(isDown));
  const target = targets.find((instance) => instance.id === choice) ?? targets[0];
  const failed = check?.outcome === 'fumble';
  const resisted = !!check && !!save && spellResisted(check, save);

  function willpowerOf(monsterId: string): number {
    const willpower = byId.get(monsterId)?.willpower;
    return willpower && isValuePair(willpower) ? willpower.value : 0;
  }

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          setCheck(rollSpellcastingCheck(bonus));
          setSave(null);
        }}
      >
        {t('sheet.spellCheckButton', { bonus })}
      </button>
      {check && (
        <span className={styles.result}>
          {t('sheet.spellCheckResult', { d1: check.dice[0], d2: check.dice[1], value: check.value })}
          {check.outcome === 'fumble' && ` — ${t('sheet.spellCheckFailed')}`}
          {check.outcome === 'critical' && ` — ${t('sheet.spellCheckAuto')}`}
          {failed && <FumbleXpButton roll={check} />}
        </span>
      )}
      {check && !failed && target && (
        <>
          <label>
            {t('sheet.attackTarget')}{' '}
            <select value={target.id} onChange={(event) => { setChoice(event.target.value); setSave(null); }}>
              {targets.map((instance) => (
                <option key={instance.id} value={instance.id}>
                  {instance.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => setSave(rollEvasion(willpowerOf(target.monsterId), fixed))}>
            {t('sheet.spellResist')}
          </button>
          <label>
            <input type="checkbox" checked={fixed} onChange={(event) => setFixed(event.target.checked)} /> {t('solo.fixed')}
          </label>
          {save && (
            <span>
              {' '}
              {t('sheet.spellResistResult', { target: save.value, caster: check.value, outcome: t(resisted ? 'sheet.spellResistedNoDamage' : 'sheet.spellNotResisted') })}
            </span>
          )}
        </>
      )}
    </span>
  );
}
