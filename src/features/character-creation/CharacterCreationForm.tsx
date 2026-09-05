import { useMemo, useState } from 'react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { ABILITY_IDS, abilityModifier, abilityTotal, type AbilityId } from '../../lib/formulas/abilities';
import {
  abilityBaseFromSplit,
  correctionRange,
  formatDiceNotation,
  isCorrectionInRange,
  type SkillBodyMind,
} from '../../lib/formulas/ability-base';
import { hpMax, mpMax } from '../../lib/formulas/hp-mp';
import { RACES, getRace } from '../../data/races';
import { getClass } from '../../data/classes';
import { CharacterSchema, CURRENT_SCHEMA_VERSION, type Character } from '../../types/character';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { listBackgroundOptions } from './backgroundOptions';
import styles from './CharacterCreationForm.module.css';

type NumberByAbility = Record<AbilityId, number>;

function zeroByAbility(): NumberByAbility {
  return { DEX: 0, AGI: 0, STR: 0, VIT: 0, INT: 0, SPR: 0 };
}

export function CharacterCreationForm({ onCreated }: { onCreated: (id: string) => void }) {
  const { t } = useTranslation();
  const setCharacters = useSetAtom(charactersAtom);
  const setActiveId = useSetAtom(activeCharacterIdAtom);

  const [name, setName] = useState('');
  const [raceId, setRaceId] = useState('');
  const [backgroundKey, setBackgroundKey] = useState('');
  const [chosenClassId, setChosenClassId] = useState('');
  const [corrections, setCorrections] = useState<NumberByAbility>(zeroByAbility());
  const [growths, setGrowths] = useState<NumberByAbility>(zeroByAbility());
  const [itemBonuses, setItemBonuses] = useState<NumberByAbility>(zeroByAbility());

  const race = getRace(raceId);
  const backgroundOptions = useMemo(() => (race ? listBackgroundOptions(race) : []), [race]);
  const background = backgroundOptions.find((option) => option.key === backgroundKey)?.entry;

  /* A few rows (Human "Adventurer") roll their own Skill/Body/Mind instead of listing a
     fixed split, so those numbers have to come from the player. */
  const [rolledSplit, setRolledSplit] = useState<SkillBodyMind>({ skill: 0, body: 0, mind: 0 });
  const rollsOwnSplit = Boolean(background) && !background?.stats;

  const split = background
    ? background.stats
      ? { skill: background.stats[0], body: background.stats[1], mind: background.stats[2] }
      : rolledSplit
    : null;

  const abilities = ABILITY_IDS.map((id) => {
    const base = split ? abilityBaseFromSplit(split, id) : 0;
    const score = { base, correction: corrections[id], growth: growths[id], itemBonus: itemBonuses[id] };
    return { id, score, total: abilityTotal(score), modifier: abilityModifier(abilityTotal(score)) };
  });

  /* A correction is a die result, so anything outside the racial die's range is a typo.
     Zero is left alone: it is the untouched initial value, not a claimed roll. Flagging is
     advisory — submitting stays possible, since house rules and GM fiat exist. */
  const abilityDice = race?.abilityDice ?? null;
  const badCorrections = abilityDice
    ? ABILITY_IDS.filter((id) => corrections[id] !== 0 && !isCorrectionInRange(abilityDice[id], corrections[id]))
    : [];

  const needsClassChoice = background?.startingClasses?.joiner === 'or';
  const startingClassIds = background?.startingClasses
    ? needsClassChoice
      ? chosenClassId
        ? [chosenClassId]
        : []
      : background.startingClasses.classIds
    : [];

  const vitTotal = abilities.find((a) => a.id === 'VIT')?.total ?? 0;
  const sprTotal = abilities.find((a) => a.id === 'SPR')?.total ?? 0;
  const wizardLevelSum = startingClassIds.filter((id) => getClass(id)?.type === 'wizard').length;
  /* Adventurer Level is the highest class level, so a background granting no starting class
     ("Normal", "Adventurer") leaves the character at level 0 — previewing HP as if a level-1
     class existed stored a current HP above the sheet's max. */
  const previewAdventurerLevel = startingClassIds.length > 0 ? 1 : 0;
  const previewHp = hpMax(previewAdventurerLevel, vitTotal);
  const previewMp = mpMax(wizardLevelSum, sprTotal);

  const canSubmit = name.trim().length > 0 && Boolean(background) && (!needsClassChoice || Boolean(chosenClassId));

  function handleRaceChange(nextRaceId: string) {
    setRaceId(nextRaceId);
    setBackgroundKey('');
    setChosenClassId('');
    setRolledSplit({ skill: 0, body: 0, mind: 0 });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || !background) return;

    const character: Character = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: crypto.randomUUID(),
      name: name.trim(),
      raceId,
      background: background.name,
      abilities: Object.fromEntries(abilities.map(({ id, score }) => [id, score])) as Character['abilities'],
      classes: startingClassIds.map((classId) => ({ classId, level: 1 })),
      hp: { current: previewHp },
      mp: { current: previewMp },
      statusEffects: [],
      equipment: { weapons: [], armor: [], shield: null, accessories: [] },
      currency: { cash: 1200, savings: 0, debt: 0 },
      combatFeats: [],
      // The background's XP is a starting purse; the classes it grants come free on top.
      experience: { total: background.xp, spent: 0 },
      spells: [],
      growthLog: [],
      reputation: 0,
    };

    const parsed = CharacterSchema.parse(character);
    setCharacters((prev) => [...prev, parsed]);
    setActiveId(parsed.id);
    onCreated(parsed.id);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div>
        <h2>{t('creation.title')}</h2>
        <p className={styles.intro}>{t('creation.intro')}</p>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="char-name">{t('creation.name')}</label>
          <input id="char-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>

        <div className={styles.field}>
          <label htmlFor="char-race">{t('creation.race')}</label>
          <select id="char-race" value={raceId} onChange={(event) => handleRaceChange(event.target.value)} required>
            <option value="" disabled>
              {t('creation.selectPlaceholder')}
            </option>
            {RACES.filter((r) => r.backgroundTables).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {race && (
          <div className={styles.field}>
            <label htmlFor="char-background">{t('creation.background')}</label>
            <select
              id="char-background"
              value={backgroundKey}
              onChange={(event) => {
                setBackgroundKey(event.target.value);
                setChosenClassId('');
                setRolledSplit({ skill: 0, body: 0, mind: 0 });
              }}
              required
            >
              <option value="" disabled>
                {t('creation.selectPlaceholder')}
              </option>
              {/* Grouped by source table: the player rolls on one of them, and without the
                  grouping both tables' "2-4" rows sit in the list looking interchangeable. */}
              {(['primary', 'additional'] as const).map((table) => {
                const options = backgroundOptions.filter((option) => option.table === table);
                if (options.length === 0) return null;
                return (
                  <optgroup key={table} label={t(`creation.backgroundTable.${table}`)}>
                    {options.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.entry.name} (
                        {option.entry.rollRange === '*' ? t('creation.gmOnly') : option.entry.rollRange}, {option.entry.xp} XP)
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        )}

        {needsClassChoice && background?.startingClasses && (
          <div className={styles.field}>
            <label htmlFor="char-starting-class">{t('creation.startingClass')}</label>
            <select id="char-starting-class" value={chosenClassId} onChange={(event) => setChosenClassId(event.target.value)} required>
              <option value="" disabled>
                {t('creation.selectPlaceholder')}
              </option>
              {background.startingClasses.classIds.map((classId) => (
                <option key={classId} value={classId}>
                  {getClass(classId)?.name ?? classId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {background && (
        <>
          {rollsOwnSplit && (
            <div className={styles.rolledSplit}>
              <p className={styles.intro}>{t('creation.rollsOwnSplit')}</p>
              <div className={styles.fields}>
                {(['skill', 'body', 'mind'] as const).map((part) => (
                  <div key={part} className={styles.field}>
                    <label htmlFor={`split-${part}`}>{t(`creation.${part}`)}</label>
                    <input
                      id={`split-${part}`}
                      type="number"
                      value={rolledSplit[part]}
                      onChange={(event) => setRolledSplit((prev) => ({ ...prev, [part]: Number(event.target.value) }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.abilityGrid}>
            {abilities.map(({ id, score, total, modifier }) => (
              <article key={id} className={styles.abilityCard} aria-label={id}>
                <div className={styles.abilityTop}>
                  <span className={styles.abilityName}>{id}</span>
                  <span className={styles.abilityTotal} aria-label={`${id} ${t('creation.total')}`}>
                    {total}
                  </span>
                  <span className={styles.abilityMod}>{modifier >= 0 ? `+${modifier}` : modifier}</span>
                </div>

                <div className={styles.abilityParts}>
                  <div className={styles.abilityPart}>
                    <span>{t('creation.baseShort')}</span>
                    <div className={styles.abilityPartStatic} aria-label={`${id} ${t('creation.base')}`}>
                      {score.base}
                    </div>
                  </div>
                  <label className={styles.abilityPart}>
                    <span title={abilityDice ? formatDiceNotation(abilityDice[id]) : undefined}>{t('creation.correctionShort')}</span>
                    <input
                      type="number"
                      value={corrections[id]}
                      onChange={(event) => setCorrections((prev) => ({ ...prev, [id]: Number(event.target.value) }))}
                      aria-label={`${id} ${t('creation.correction')}`}
                      aria-invalid={badCorrections.includes(id) || undefined}
                      className={badCorrections.includes(id) ? styles.invalid : undefined}
                      title={abilityDice ? formatDiceNotation(abilityDice[id]) : undefined}
                    />
                  </label>
                  <label className={styles.abilityPart}>
                    <span>{t('creation.growthShort')}</span>
                    <input
                      type="number"
                      value={growths[id]}
                      onChange={(event) => setGrowths((prev) => ({ ...prev, [id]: Number(event.target.value) }))}
                      aria-label={`${id} ${t('creation.growth')}`}
                    />
                  </label>
                  <label className={styles.abilityPart}>
                    <span>{t('creation.itemBonusShort')}</span>
                    <input
                      type="number"
                      value={itemBonuses[id]}
                      onChange={(event) => setItemBonuses((prev) => ({ ...prev, [id]: Number(event.target.value) }))}
                      aria-label={`${id} ${t('creation.itemBonus')}`}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>

          {badCorrections.length > 0 && abilityDice && (
            <p className={styles.warning} role="status">
              {t('creation.correctionOutOfRange', {
                list: badCorrections
                  .map((id) => {
                    const { min, max } = correctionRange(abilityDice[id]);
                    return `${id} — ${formatDiceNotation(abilityDice[id])} (${min}–${max})`;
                  })
                  .join(', '),
              })}
            </p>
          )}

          <div className={styles.preview}>
            <strong className={styles.previewStat}>{t('creation.hpPreview', { value: previewHp })}</strong>
            <strong className={styles.previewStat}>{t('creation.mpPreview', { value: previewMp })}</strong>
          </div>
        </>
      )}

      <div className={styles.actions}>
        <button type="submit" disabled={!canSubmit}>
          {t('creation.submit')}
        </button>
      </div>
    </form>
  );
}
