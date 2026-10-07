import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatValue, isValuePair, type Monster } from '../../data/monsters';
import {
  damageSection,
  healSection,
  isDefeated,
  isDown,
  lootFor,
  numberOf,
  resolveAttack,
  rollD6,
  rollEvasion,
  rollKnowledge,
  rollDeathCheck,
  applyDeathCheck,
  declarationsOf,
  regenerate,
  autoIdentifies,
  rollMonsterAttack,
  rollMonsterDamage,
  spawnMonster,
  type EncounterMonster,
  type EvasionRoll,
  type KnowledgeRoll,
  type DeathCheckRoll,
  type MonsterAttackRoll,
  type MonsterDamageRoll,
} from '../../lib/encounter';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { characterDefense, characterEvasion } from '../../lib/formulas/character-defense';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { initiative } from '../../lib/formulas/derived-stats';
import { activeCharacterIdAtom, charactersAtom, useUpdateCharacter } from '../../state/characters';
import { encounterAtom, hideUnknownAtom } from '../../state/encounter';
import type { Character } from '../../types/character';
import { CampaignPanel } from './CampaignPanel';
import { DungeonPanel } from './DungeonPanel';
import { GeneratorsPanel } from './GeneratorsPanel';
import { HexMapPanel } from './HexMapPanel';
import { OraclePanel } from './OraclePanel';
import { PartyPanel } from './PartyPanel';
import styles from './SoloView.module.css';
import { useMonsters } from './useMonsters';

function levelOf(character: Character, classId: string): number {
  return character.classes.filter((entry) => entry.classId === classId).reduce((max, entry) => Math.max(max, entry.level), 0);
}

interface AttackReport {
  sectionIndex: number;
  declaration?: string;
  attack: MonsterAttackRoll;
  evasion: EvasionRoll;
  hit: boolean;
  damage: MonsterDamageRoll | null;
  /** Damage left after the target's Defense; what the character loses if the player applies it. */
  landed: number;
}

function MonsterCard({
  monster,
  instance,
  fixed,
  hideUnknown,
  character,
  onChange,
  onRemove,
}: {
  monster: Monster;
  instance: EncounterMonster;
  fixed: boolean;
  hideUnknown: boolean;
  character: Character | undefined;
  onChange: (next: EncounterMonster) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const updateCharacter = useUpdateCharacter(character?.id ?? '');
  const [amounts, setAmounts] = useState<string[]>([]);
  const [magic, setMagic] = useState(false);
  const [report, setReport] = useState<AttackReport | null>(null);
  const [applied, setApplied] = useState(false);
  const [loot, setLoot] = useState<{ sum: number; items: string[] } | null>(null);

  const defeated = isDefeated(monster, instance);
  const [knowledge, setKnowledge] = useState<KnowledgeRoll | null>(null);
  const [deathChecks, setDeathChecks] = useState<Record<number, DeathCheckRoll>>({});
  const [declared, setDeclared] = useState<Record<number, string>>({});

  /** Optional (CR I p. 383): a downed section rolls Fortitude against its HP deficit instead of simply dying. */
  function deathCheck(index: number) {
    const fortitude = isValuePair(monster.fortitude) ? monster.fortitude.value : 0;
    const check = rollDeathCheck(fortitude, instance.sections[index].hp, fixed);
    setDeathChecks((current) => ({ ...current, [index]: check }));
    onChange(applyDeathCheck(instance, index, check));
  }

  const sageLevel = character ? levelOf(character, 'sage') : 0;
  const auto = character ? autoIdentifies(monster, character.classes.map((entry) => entry.classId)) : false;
  const identified = instance.identified || auto;
  const concealed = hideUnknown && !identified;

  /** Sage Lv + INT bonus against the monster's Rep/Weak; a class that knows this kind of monster identifies it unrolled. */
  function checkKnowledge() {
    if (!character || sageLevel === 0) return;
    const roll = rollKnowledge(monster, sageLevel + abilityModifier(abilityTotal(character.abilities.INT)), fixed);
    setKnowledge(roll);
    onChange({ ...instance, identified: instance.identified || roll.identified, weakKnown: instance.weakKnown || roll.weak });
  }

  function hurt(index: number) {
    const amount = Number(amounts[index]) || 0;
    if (amount <= 0) return;
    const section = monster.sections[index];
    onChange(damageSection(instance, index, amount, numberOf(section.defense), !magic).instance);
    setAmounts((list) => list.map((value, i) => (i === index ? '' : value)));
  }

  function heal(index: number) {
    const amount = Number(amounts[index]) || 0;
    if (amount <= 0) return;
    onChange(healSection(instance, index, amount, numberOf(monster.sections[index].hp)));
    setAmounts((list) => list.map((value, i) => (i === index ? '' : value)));
  }

  /** One monster attack against the active character: the monster's Accuracy check against the
   *  character's Evasion check (rolled here, or the Fixed Value), then damage less Defense. */
  function attack(index: number) {
    const section = monster.sections[index];
    const base = rollMonsterAttack(section, fixed);
    if (!base) return;
    // A declared attack (Power Strike, Decoy Attack, …) changes this one attack, then is spent.
    const declaration = declarationsOf(monster, index).find((entry) => entry.name === declared[index]);
    const roll = declaration ? { ...base, successValue: base.successValue + declaration.accuracy } : base;
    const evasion = rollEvasion(character ? characterEvasion(character) : 0, fixed);
    const hit = resolveAttack(roll, evasion);
    const rolled = hit ? rollMonsterDamage(section, fixed) : null;
    const damage = rolled && declaration ? { ...rolled, total: Math.max(0, rolled.total + declaration.damage) } : rolled;
    const landed = damage ? Math.max(0, damage.total - (character ? characterDefense(character) : 0)) : 0;
    setReport({ sectionIndex: index, declaration: declaration?.name, attack: roll, evasion, hit, damage, landed });
    setDeclared((current) => ({ ...current, [index]: '' }));
    setApplied(false);
  }

  function applyToCharacter() {
    if (!character || !report) return;
    updateCharacter((c) => ({ ...c, hp: { current: c.hp.current - report.landed } }));
    setApplied(true);
  }

  function rollLoot() {
    const sum = rollD6() + rollD6();
    setLoot({ sum, items: lootFor(monster.loot, sum).map((row) => row.item) });
  }

  return (
    <article className={`${styles.card} ${defeated ? styles.cardDefeated : ''}`} aria-label={instance.label}>
      <header className={styles.cardHead}>
        <h4>
          {instance.label} <span className={styles.level}>{t('solo.level', { level: monster.level })}</span>
        </h4>
        {defeated && <span className={styles.defeated}>{t('solo.defeated')}</span>}
        <button type="button" onClick={onRemove} aria-label={t('solo.removeMonster', { name: instance.label })}>
          {t('solo.remove')}
        </button>
      </header>
      <p className={styles.facts}>
        <span>
          {t('reference.monsters.initiative')}: {concealed ? '?' : monster.initiative}
        </span>
        <span>
          {t('reference.monsters.fortitude')}: {concealed ? '?' : formatValue(monster.fortitude)}
        </span>
        <span>
          {t('reference.monsters.willpower')}: {concealed ? '?' : formatValue(monster.willpower)}
        </span>
        <span>
          {t('reference.monsters.weakPoint')}: {hideUnknown && !instance.weakKnown ? '?' : monster.weakPoint}
        </span>
        <span>
          {t('solo.knowledgeTargets', { rep: monster.reputation ?? '–', weak: monster.weakness ?? '–' })}
        </span>
      </p>
      <div className={styles.controls}>
        <button type="button" onClick={checkKnowledge} disabled={!character || sageLevel === 0 || (identified && instance.weakKnown === true)}>
          {t('solo.knowledgeCheck')}
        </button>
        {auto && <span className={styles.numeric}>{t('solo.knowledgeAuto')}</span>}
        {sageLevel === 0 && <span className={styles.numeric}>{t('solo.knowledgeNoSage')}</span>}
        {knowledge && (
          <span role="status">
            {knowledge.dice ? `${knowledge.dice[0]}+${knowledge.dice[1]}` : t('solo.fixed')} → {knowledge.value}
            {knowledge.outcome === 'fumble' && ` — ${t('solo.fumble')}`}
            {' · '}
            {knowledge.identified ? t('solo.knowledgeIdentified') : t('solo.knowledgeNotIdentified')}
            {' · '}
            {knowledge.weak ? t('solo.knowledgeWeak') : t('solo.knowledgeNotWeak')}
          </span>
        )}
      </div>

      {monster.sections.map((section, index) => {
        const state = instance.sections[index];
        const max = numberOf(section.hp);
        const down = isDown(state);
        const attackable = section.accuracy !== null && 'value' in section.accuracy && section.damage !== null;
        return (
          <div key={`${section.style}-${index}`} className={`${styles.section} ${down ? styles.sectionDown : ''}`}>
            <div className={styles.sectionHead}>
              <strong>{section.style}</strong>
              <span className={styles.numeric}>
                {t('reference.monsters.defense')} {section.defense ?? '–'} · {t('reference.monsters.evasion')} {formatValue(section.evasion)}
                {section.mp !== null && ` · MP ${state.mp}/${numberOf(section.mp)}`}
              </span>
              {down && <span className={styles.defeated}>{state.fate ? t(`solo.fate.${state.fate}`) : t('solo.down')}</span>}
              {down && !state.fate && (
                <button type="button" onClick={() => deathCheck(index)} aria-label={`${section.style} ${t('solo.deathCheck')}`}>
                  {t('solo.deathCheck')}
                </button>
              )}
              {deathChecks[index] && (
                <span role="status">
                  {deathChecks[index].dice ? `${deathChecks[index].dice[0]}+${deathChecks[index].dice[1]}` : t('solo.fixed')} → {deathChecks[index].value} / {deathChecks[index].target}{' '}
                  — {t(`solo.deathResult.${deathChecks[index].result}`)}
                </span>
              )}
            </div>
            <div className={styles.bar} role="meter" aria-label={`${section.style} HP`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0, state.hp)}>
              <div className={styles.barFill} style={{ width: `${max > 0 ? Math.max(0, Math.min(100, (state.hp / max) * 100)) : 0}%` }} />
              <span className={styles.barText}>
                {state.hp} / {max}
              </span>
            </div>
            <div className={styles.controls}>
              <input
                type="number"
                min={0}
                value={amounts[index] ?? ''}
                onChange={(e) => setAmounts((list) => Object.assign([...list], { [index]: e.target.value }))}
                aria-label={`${section.style} ${t('solo.amount')}`}
                placeholder={t('solo.amount')}
              />
              <button type="button" onClick={() => hurt(index)}>
                {t('solo.hurt')}
              </button>
              <button type="button" onClick={() => heal(index)}>
                {t('solo.heal')}
              </button>
              {attackable && declarationsOf(monster, index).length > 0 && (
                <select
                  aria-label={`${section.style} ${t('solo.declaration')}`}
                  value={declared[index] ?? ''}
                  onChange={(e) => setDeclared((current) => ({ ...current, [index]: e.target.value }))}
                >
                  <option value="">{t('solo.noDeclaration')}</option>
                  {declarationsOf(monster, index).map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name} ({t('solo.declarationEffect', { accuracy: entry.accuracy >= 0 ? '+' + entry.accuracy : entry.accuracy, damage: entry.damage >= 0 ? '+' + entry.damage : entry.damage })})
                    </option>
                  ))}
                </select>
              )}
              {attackable && (
                <button type="button" onClick={() => attack(index)} aria-label={`${instance.label} ${section.style} ${t('solo.attack')}`}>
                  {t('solo.attack')} ({formatValue(section.accuracy)} · {section.damage})
                </button>
              )}
            </div>
          </div>
        );
      })}

      <label className={styles.inline}>
        <input type="checkbox" checked={magic} onChange={(e) => setMagic(e.target.checked)} />
        {t('solo.magicDamage')}
      </label>

      {report && (
        <div className={styles.report} role="status" aria-live="polite">
          <p>
            {monster.sections[report.sectionIndex].style}: {report.declaration && `[${report.declaration}] `}{t('solo.attackLine', {
              roll: report.attack.dice[0] ? `${report.attack.dice[0]}+${report.attack.dice[1]}` : t('solo.fixed'),
              value: report.attack.successValue,
            })}
            {report.attack.outcome === 'fumble' && ` — ${t('solo.fumble')}`}
            {report.attack.outcome === 'critical' && ` — ${t('solo.autoHit')}`}
          </p>
          <p>
            {t('solo.evasionLine', {
              roll: report.evasion.dice ? `${report.evasion.dice[0]}+${report.evasion.dice[1]}` : t('solo.fixed'),
              value: report.evasion.value,
            })}{' '}
            — <strong>{report.hit ? t('solo.hit') : t('solo.miss')}</strong>
          </p>
          {report.damage && (
            <p>
              {t('solo.damageLine', {
                roll: report.damage.dice ? `${report.damage.dice[0]}+${report.damage.dice[1]}` : t('solo.fixed'),
                modifier: report.damage.modifier,
                total: report.damage.total,
                defense: character ? characterDefense(character) : 0,
                landed: report.landed,
              })}
            </p>
          )}
          {report.hit && character && report.landed > 0 && (
            <button type="button" onClick={applyToCharacter} disabled={applied}>
              {applied ? t('solo.applied') : t('solo.applyDamage', { landed: report.landed, name: character.name })}
            </button>
          )}
        </div>
      )}

      {defeated && monster.loot.length > 0 && (
        <div className={styles.loot}>
          <button type="button" onClick={rollLoot}>
            {t('solo.rollLoot')}
          </button>
          {loot && (
            <p role="status">
              2d6 = {loot.sum}: {loot.items.filter((item) => item !== 'Nothing').join('; ') || t('solo.nothing')}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function EncounterPanel({ fixed, onFixedChange }: { fixed: boolean; onFixedChange: (next: boolean) => void }) {
  const { t } = useTranslation();
  const [encounter, setEncounter] = useAtom(encounterAtom);
  const [hideUnknown, setHideUnknown] = useAtom(hideUnknownAtom);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const character = characters.find((entry) => entry.id === activeId);

  const { monsters, byId } = useMonsters();
  const [regenNote, setRegenNote] = useState('');

  /** Ends the round: monsters with "Regeneration = N points" recover it (CR I: at the end of each round). */
  function nextRound() {
    const notes: string[] = [];
    const monsters = encounter.monsters.map((entry) => {
      const monster = byId.get(entry.monsterId);
      if (!monster) return entry;
      const result = regenerate(monster, entry);
      if (result.healed > 0) notes.push(`${entry.label} +${result.healed}`);
      return result.instance;
    });
    setEncounter({ round: encounter.round + 1, monsters });
    setRegenNote(notes.join(', '));
  }

  const updateCharacter = useUpdateCharacter(character?.id ?? '');
  const [pcDeath, setPcDeath] = useState<DeathCheckRoll | null>(null);

  /** A PC at 0 HP or less is unconscious and rolls a Death Check: Adventurer Level + VIT bonus against the deficit (CR I pp. 110, 184). */
  function pcDeathCheck() {
    if (!character) return;
    const standard = adventurerLevel(character.classes) + abilityModifier(abilityTotal(character.abilities.VIT));
    const check = rollDeathCheck(standard, character.hp.current, fixed);
    setPcDeath(check);
    if (check.result === 'revived') updateCharacter((c) => ({ ...c, hp: { current: 1 } }));
  }
  const [search, setSearch] = useState('');
  const [pick, setPick] = useState('');
  const [count, setCount] = useState('1');
  const [initiativeRoll, setInitiativeRoll] = useState<{ dice: [number, number]; value: number } | null>(null);

  const options = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (monsters ?? []).filter((monster) => monster.category !== 'Familiars' && (!query || monster.name.toLowerCase().includes(query))).slice(0, 80);
  }, [monsters, search]);

  function addMonsters() {
    const monster = byId.get(pick);
    if (!monster) return;
    setEncounter((current) => {
      const labels = current.monsters.map((entry) => entry.label);
      const added: EncounterMonster[] = [];
      const copies = Math.max(1, Math.min(12, Math.floor(Number(count)) || 1));
      for (let i = 0; i < copies; i += 1) {
        const next = spawnMonster(monster, [...labels, ...added.map((entry) => entry.label)], crypto.randomUUID());
        added.push(next);
      }
      return { ...current, monsters: [...current.monsters, ...added] };
    });
  }

  const monsterInitiative = Math.max(0, ...encounter.monsters.map((entry) => Number.parseInt(byId.get(entry.monsterId)?.initiative ?? '0', 10) || 0));

  function rollInitiative() {
    if (!character) return;
    const dice: [number, number] = [rollD6(), rollD6()];
    const agiMod = abilityModifier(abilityTotal(character.abilities.AGI));
    const value = dice[0] + dice[1] + initiative(Math.max(levelOf(character, 'scout'), levelOf(character, 'tactician')), agiMod);
    setInitiativeRoll({ dice, value });
  }

  return (
    <section className={styles.panel} aria-labelledby="solo-encounter">
      <div className={styles.panelHead}>
        <h3 id="solo-encounter">{t('solo.encounter')}</h3>
        <p className={styles.note}>{t('solo.encounterNote')}</p>
      </div>

      <div className={styles.toolbar}>
        <span className={styles.round}>{t('solo.round', { round: encounter.round })}</span>
        <button type="button" onClick={nextRound}>
          {t('solo.nextRound')}
        </button>
        <label className={styles.inline}>
          <input type="checkbox" checked={fixed} onChange={(e) => onFixedChange(e.target.checked)} />
          {t('solo.fixedValues')}
        </label>
        <label className={styles.inline}>
          <input type="checkbox" checked={hideUnknown} onChange={(e) => setHideUnknown(e.target.checked)} />
          {t('solo.hideUnknown')}
        </label>
        <button type="button" onClick={() => setEncounter({ round: 0, monsters: [] })} disabled={encounter.monsters.length === 0 && encounter.round === 0}>
          {t('solo.endEncounter')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('reference.monsters.search')}
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('solo.searchHint')} />
        </label>
        <label>
          {t('solo.monster')}
          <select value={pick} onChange={(e) => setPick(e.target.value)} disabled={!monsters}>
            <option value="">{monsters ? t('creation.selectPlaceholder') : t('reference.monsters.loading')}</option>
            {options.map((monster) => (
              <option key={monster.id} value={monster.id}>
                {monster.level}
                {monster.levelPlus ? '+' : ''} · {monster.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('solo.count')}
          <input type="number" min={1} max={12} value={count} onChange={(e) => setCount(e.target.value)} />
        </label>
        <button type="button" onClick={addMonsters} disabled={!pick}>
          {t('solo.addMonsters')}
        </button>
      </div>

      {encounter.monsters.length > 0 && (
        <div className={styles.toolbar}>
          <span>{t('solo.monsterInitiative', { value: monsterInitiative })}</span>
          <button type="button" onClick={rollInitiative} disabled={!character}>
            {t('solo.rollInitiative')}
          </button>
          {initiativeRoll && (
            <span role="status">
              {initiativeRoll.dice[0]}+{initiativeRoll.dice[1]} → {initiativeRoll.value} ·{' '}
              <strong>{initiativeRoll.value >= monsterInitiative ? t('solo.youFirst') : t('solo.monstersFirst')}</strong>
            </span>
          )}
        </div>
      )}

      {regenNote && (
        <p className={styles.note} role="status">
          {t('solo.regenerated', { list: regenNote })}
        </p>
      )}

      {!character && <p className={styles.note}>{t('solo.noCharacter')}</p>}

      {character && character.hp.current <= 0 && (
        <div className={styles.toolbar}>
          <span>{t('solo.pcDown', { name: character.name, hp: character.hp.current })}</span>
          <button type="button" onClick={pcDeathCheck}>
            {t('solo.deathCheck')}
          </button>
          {pcDeath && (
            <span role="status">
              {pcDeath.dice ? `${pcDeath.dice[0]}+${pcDeath.dice[1]}` : t('solo.fixed')} → {pcDeath.value} / {pcDeath.target} — {t(`solo.deathResult.${pcDeath.result}`)}
            </span>
          )}
        </div>
      )}

      {encounter.monsters.length === 0 ? (
        <p className={styles.note}>{t('solo.emptyEncounter')}</p>
      ) : (
        <div className={styles.cards}>
          {encounter.monsters.map((instance) => {
            const monster = byId.get(instance.monsterId);
            if (!monster) return null;
            return (
              <MonsterCard
                key={instance.id}
                monster={monster}
                instance={instance}
                fixed={fixed}
                hideUnknown={hideUnknown}
                character={character}
                onChange={(next) =>
                  setEncounter((current) => ({ ...current, monsters: current.monsters.map((entry) => (entry.id === next.id ? next : entry)) }))
                }
                onRemove={() => setEncounter((current) => ({ ...current, monsters: current.monsters.filter((entry) => entry.id !== instance.id) }))}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export function SoloView({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  // One setting for both panels: whether the table rolls dice or uses the printed Fixed Values.
  const [fixed, setFixed] = useState(false);

  return (
    <div className={styles.solo}>
      <div className={styles.head}>
        <div>
          <h2>{t('solo.title')}</h2>
          <p className={styles.note}>{t('solo.intro')}</p>
        </div>
        <button type="button" onClick={onClose}>
          {t('reference.close')}
        </button>
      </div>
      <EncounterPanel fixed={fixed} onFixedChange={setFixed} />
      <PartyPanel fixed={fixed} />
      <HexMapPanel />
      <DungeonPanel />
      <GeneratorsPanel />
      <OraclePanel />
      <CampaignPanel />
    </div>
  );
}
