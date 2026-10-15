import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValuePair } from '../../data/monsters';
import { damageSection, rollEvasion, tableTargets, type EvasionRoll } from '../../lib/encounter';
import { damageTraitsOf, traitAdjustment } from '../../lib/monster-skills';
import { halveRoundUp, spellResisted, type SpellcastingCheck } from '../../lib/spell-check';
import { armorPiercerDefense } from '../../lib/formulas/attack-modifiers';
import { encounterAtom, showMonsterHpAtom } from '../../state/encounter';
import { useMonsters } from './useMonsters';

/**
 * A player's weapon attack aimed at a monster on the table: the target's Defense comes from its card
 * (so [Armor Piercer] can halve it), and the damage that gets through can be put on its HP.
 * Falls back to a typed Defense when the table is empty or the player aims at nothing in particular.
 */
/** What a spell brings to the target: its casting check, and whether its damage may be halved by Willpower ("Resistance: Half"). */
export interface SpellAim {
  check: SpellcastingCheck | null;
  resistable: boolean;
  /** Damage of the first Power Table roll alone: a resisted spell cannot critical, so the chain is dropped. */
  firstDamage: number;
}

const NO_TRAITS = { bludgeoningReduction: 0, fireBonus: 0 };

export function AttackTarget({
  tier,
  damage,
  critical,
  magic = false,
  spell,
  initialTarget = '',
  bludgeoning = false,
}: {
  tier: 0 | 1 | 2 | 3;
  damage: number;
  critical: boolean;
  magic?: boolean;
  spell?: SpellAim;
  /** A target already chosen by the Accuracy check that led here. */
  initialTarget?: string;
  /** The weapon's blows are of the bludgeoning type (mace, staff, flail, hammer, fists): [Tough Skin] starts ticked. */
  bludgeoning?: boolean;
}) {
  const { t } = useTranslation();
  const [encounter, setEncounter] = useAtom(encounterAtom);
  const { byId } = useMonsters();
  const [choice, setChoice] = useState(initialTarget);
  const [typed, setTyped] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [fixed, setFixed] = useState(false);
  const [save, setSave] = useState<EvasionRoll | null>(null);
  const [blunt, setBlunt] = useState(bludgeoning);
  const [fire, setFire] = useState(false);

  const showHp = useAtomValue(showMonsterHpAtom);
  const targets = tableTargets(encounter, byId, showHp);
  const target = targets.find((entry) => entry.key === choice);
  const rawDefense = magic ? 0 : target ? target.defense : Math.max(0, Number(typed) || 0);
  const known = magic ? target !== undefined : target !== undefined || typed !== '';
  const defense = armorPiercerDefense(tier, rawDefense, critical);
  const failed = spell?.check?.outcome === 'fumble';
  const resisted = !!spell && !!spell.check && !!save && spellResisted(spell.check, save);
  const rolled = resisted ? halveRoundUp(critical ? spell!.firstDamage : damage) : damage;
  const traits = target ? damageTraitsOf(target.monster, target.sectionIndex) : NO_TRAITS;
  const adjust = traitAdjustment(traits, { bludgeoning: blunt, fire });
  const net = Math.max(0, rolled - defense);
  const dealt = failed ? 0 : net > 0 ? Math.max(0, net + adjust) : 0;
  const applyKey = target ? `${target.key}:${damage}:${critical}:${save?.value ?? ''}:${adjust}` : '';

  function willpowerOf(monsterId: string): number {
    const willpower = byId.get(monsterId)?.willpower;
    return willpower && isValuePair(willpower) ? willpower.value : 0;
  }

  function apply() {
    if (!target) return;
    const instance = encounter.monsters[target.monsterIndex];
    const result = damageSection(instance, target.sectionIndex, rolled, defense, !magic, adjust);
    setEncounter((current) => ({ ...current, monsters: current.monsters.map((entry) => (entry.id === result.instance.id ? result.instance : entry)) }));
    setAppliedTo(applyKey);
  }

  return (
    <span>
      {' '}
      <label>
        {t('sheet.attackTarget')}{' '}
        <select value={choice} onChange={(event) => { setChoice(event.target.value); setAppliedTo(''); setSave(null); }}>
          <option value="">{t('sheet.attackTargetManual')}</option>
          {targets.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.label}
            </option>
          ))}
        </select>
      </label>
      {traits.bludgeoningReduction > 0 && (
        <label>
          {' '}
          <input type="checkbox" checked={blunt} onChange={(event) => setBlunt(event.target.checked)} /> {t('sheet.toughSkin', { points: traits.bludgeoningReduction })}
        </label>
      )}
      {traits.fireBonus > 0 && (
        <label>
          {' '}
          <input type="checkbox" checked={fire} onChange={(event) => setFire(event.target.checked)} /> {t('sheet.fireVulnerability', { points: traits.fireBonus })}
        </label>
      )}
      {!target && !magic && (
        <>
          {' '}
          <label>
            {t('sheet.armorPiercerDefense')}{' '}
            <input type="number" min={0} value={typed} onChange={(event) => setTyped(event.target.value)} style={{ width: '4.5em' }} />
          </label>
        </>
      )}
      {spell && target && spell.check && spell.resistable && !failed && (
        <>
          {' '}
          <button type="button" onClick={() => setSave(rollEvasion(willpowerOf(encounter.monsters[target.monsterIndex].monsterId), fixed))}>
            {t('sheet.spellResist')}
          </button>
          <label>
            <input type="checkbox" checked={fixed} onChange={(event) => setFixed(event.target.checked)} /> {t('solo.fixed')}
          </label>
          {save && (
            <span>
              {' '}
              {t('sheet.spellResistResult', { target: save.value, caster: spell.check.value, outcome: t(resisted ? 'sheet.spellResisted' : 'sheet.spellNotResisted') })}
            </span>
          )}
        </>
      )}
      {failed && <span> {t('sheet.spellCheckFailed')}</span>}
      {known && <span> {magic ? t('sheet.spellDealt', { dealt }) : t('sheet.armorPiercerDealt', { defense, dealt })}</span>}
      {target && (
        <>
          {' '}
          <button type="button" onClick={apply} disabled={appliedTo === applyKey}>
            {appliedTo === applyKey ? t('sheet.attackTargetApplied') : t('sheet.attackTargetApply', { dealt })}
          </button>
        </>
      )}
    </span>
  );
}
