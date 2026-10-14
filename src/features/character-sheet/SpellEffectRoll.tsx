import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { rollWeaponDamage, type DamageRoll } from '../../lib/formulas/damage-roll';
import { hpMax } from '../../lib/formulas/hp-mp';
import { spellMagicPower } from '../../lib/spellcasting';
import type { SpellPower } from '../../data/spell-power';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import { rollSpellcastingCheck, type SpellcastingCheck } from '../../lib/spell-check';
import { AttackTarget } from '../solo/AttackTarget';
import { FumbleXpButton } from './FumbleXp';
import styles from './DiceRoll.module.css';

/** The most targets one casting is offered against; the book's area spells go further, but a table seldom needs more. */
const MAX_TARGETS = 8;

/**
 * The Power roll of a spell that deals damage or heals: Power Table + Magic Power. One Spellcasting check serves
 * every target; damage is rolled for each target on its own, and so is each target's Willpower (CR I pp. 168–169).
 * Damage ignores Defense (spells are magic) and can be put on a monster at the table; healing goes onto the
 * caster's own HP (never past the maximum). Critical Value is 10 for damage and unreachable for healing.
 */
export function SpellEffectRoll({ character, school, spell, fire = 0 }: { character: Character; school: string; spell: SpellPower; /** [Witch's Fire] on this casting: +2 (a single target) or +1 (an area) to power rolls of 3-10. */ fire?: 0 | 1 | 2 }) {
  const { t } = useTranslation();
  const [check, setCheck] = useState<SpellcastingCheck | null>(null);
  const [noResist, setNoResist] = useState(false);
  const [targets, setTargets] = useState(1);
  const bonus = spellMagicPower(character, school);
  const heal = spell.kind === 'heal';

  const checkText = check
    ? t('sheet.spellCheckResult', { d1: check.dice[0], d2: check.dice[1], value: check.value }) + (check.outcome === 'fumble' ? ' — ' + t('sheet.spellCheckFailed') : check.outcome === 'critical' ? ' — ' + t('sheet.spellCheckAuto') : '')
    : '';

  return (
    <span className={styles.wrap}>
      <button type="button" className={styles.button} onClick={() => setCheck(rollSpellcastingCheck(bonus))}>
        {t('sheet.spellCheckButton', { bonus })}
      </button>
      {check && (
        <span className={styles.result}>
          {checkText}
          {check.outcome === 'fumble' && <FumbleXpButton roll={check} />}
        </span>
      )}
      {!heal && (
        <>
          <label>
            <input type="checkbox" checked={noResist} onChange={(event) => setNoResist(event.target.checked)} /> {t('sheet.spellNoResist')}
          </label>
          <label>
            {t('sheet.spellTargets')}{' '}
            <input
              type="number"
              min={1}
              max={MAX_TARGETS}
              value={targets}
              onChange={(event) => setTargets(Math.min(MAX_TARGETS, Math.max(1, Math.floor(Number(event.target.value)) || 1)))}
              style={{ width: '3.5em' }}
            />
          </label>
        </>
      )}
      {Array.from({ length: heal ? 1 : targets }, (_, index) => (
        <PowerRoll key={index} character={character} spell={spell} bonus={bonus} check={check} resistable={!noResist} index={index} many={!heal && targets > 1} fire={fire} />
      ))}
    </span>
  );
}

/** One target's damage roll (or the one healing roll), with its own critical chain and its own Willpower. */
function PowerRoll({
  character,
  spell,
  bonus,
  check,
  resistable,
  index,
  many,
  fire,
}: {
  character: Character;
  spell: SpellPower;
  bonus: number;
  check: SpellcastingCheck | null;
  resistable: boolean;
  index: number;
  many: boolean;
  fire: 0 | 1 | 2;
}) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [roll, setRoll] = useState<DamageRoll | null>(null);
  const [healed, setHealed] = useState<number | null>(null);
  const heal = spell.kind === 'heal';

  function doHeal() {
    if (!roll) return;
    const room = Math.max(0, hpMax(adventurerLevel(character.classes), abilityTotal(character.abilities.VIT)) - character.hp.current);
    const amount = Math.min(roll.calculatedDamage, room);
    update((c) => ({ ...c, hp: { current: c.hp.current + amount } }));
    setHealed(amount);
  }

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={() => {
          setRoll(rollWeaponDamage(spell.power, heal ? 13 : 10, bonus, false, Math.random, fire));
          setHealed(null);
        }}
      >
        {t(heal ? 'sheet.spellHealRoll' : 'sheet.spellDamageRoll', { power: spell.power, bonus })}
        {many && ` #${index + 1}`}
      </button>
      {roll && (
        <span className={styles.result} role="status">
          {roll.fumble
            ? <>{t('sheet.damageRollFumble')} <FumbleXpButton roll={roll} /></>
            : t('sheet.damageRollTotal', { total: roll.powerTableTotal, extraDamage: bonus, calculated: roll.calculatedDamage })}
          {!roll.fumble && roll.steps.length > 1 && <span className={styles.critical}> ({t('sheet.damageRollCritical')})</span>}
          {heal ? (
            <>
              {' '}
              <button type="button" onClick={doHeal} disabled={healed !== null}>
                {healed === null ? t('sheet.spellHealApply', { amount: roll.calculatedDamage }) : t('sheet.spellHealed', { amount: healed })}
              </button>
            </>
          ) : (
            <AttackTarget
              tier={0}
              damage={roll.calculatedDamage}
              critical={roll.steps.length > 1}
              magic
              spell={{ check, resistable, firstDamage: roll.steps[0].value + bonus }}
            />
          )}
        </span>
      )}
    </span>
  );
}
