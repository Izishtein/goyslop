import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel, wizardLevelSum } from '../../lib/formulas/character-levels';
import { fortitude, willpower } from '../../lib/formulas/derived-stats';
import { hpMax, mpMax } from '../../lib/formulas/hp-mp';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { getClass } from '../../data/classes';
import { getRace, racialAbilitiesFor } from '../../data/races';
import type { Character } from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import { AbilitySection } from './AbilitySection';
import { AvatarField } from './AvatarField';
import { ClassesSection } from './ClassesSection';
import { DiceRoll } from './DiceRoll';
import { CombatStatsSection } from './CombatStatsSection';
import { EquipmentSection } from './EquipmentSection';
import { CombatFeatsSection } from './CombatFeatsSection';
import { SpellsSection } from './SpellsSection';
import { ArtsSection } from './ArtsSection';
import { EvocationsSection } from './EvocationsSection';
import { FellowSection } from './FellowSection';
import { WorkSkillsSection } from './WorkSkillsSection';
import { MountsSection } from './MountsSection';
import { GeomancerSection } from './GeomancerSection';
import { TacticianSection } from './TacticianSection';
import { EssenceWeavingSection } from './EssenceWeavingSection';
import { SchoolsSection } from './SchoolsSection';
import { NotesSection } from './NotesSection';
import { StatusEffectsSection } from './StatusEffectsSection';
import { HpMpPanel } from './HpMpPanel';
import { SheetDrawer } from './SheetDrawer';
import { hasMounts } from './sections';
import { hpFillClass, percent } from './vitals';
import styles from './CharacterSheetView.module.css';

/* The seventeen sections used to stack into one long scroll (latterly balanced into CSS
   columns), which meant the half of the sheet a player needs mid-turn was usually below the
   fold. They are grouped into five tabbed panels instead, next to a left rail that never
   changes — abilities and combat numbers are what every roll reads, so they stay put while
   the panel beside them switches.

   Grouping follows what a turn needs at once rather than the book's chapter order:
   Equipment carries the weapons (i.e. the attacks), Combat the SCA feats and Battle Mastery
   schools, Magic every casting system, Skills the non-combat class systems. Mounts is the
   one tab that can be empty for a character — see `hasMounts` — so it only appears for
   someone who rides. */
const TAB_IDS = ['equipment', 'combat', 'magic', 'skills', 'mounts'] as const;
type TabId = (typeof TAB_IDS)[number];

/** Panels opened over the sheet from the header, one at a time. */
type DrawerId = 'vitals' | 'status' | 'classes' | 'notes';

const MONEY_FIELDS = [
  { key: 'cash', label: 'sheet.cash' },
  { key: 'savings', label: 'sheet.savings' },
  { key: 'debt', label: 'sheet.debt' },
] as const;

export function CharacterSheetView({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const race = getRace(character.raceId);
  const racialAbilities = racialAbilitiesFor(character.raceId);
  const advLevel = adventurerLevel(character.classes);
  const wizLevels = wizardLevelSum(character.classes);

  const vitMod = abilityModifier(abilityTotal(character.abilities.VIT));
  const sprMod = abilityModifier(abilityTotal(character.abilities.SPR));
  const vitTotal = abilityTotal(character.abilities.VIT);
  const sprTotal = abilityTotal(character.abilities.SPR);

  const hpTotal = hpMax(advLevel, vitTotal);
  const mpTotal = mpMax(wizLevels, sprTotal);
  /* Displayed clamped as well as written clamped: a stored value can outlive the maximum
     that justified it (drop a level of VIT and yesterday's 23 becomes impossible), and the
     bar hid that — it clamps to 100% while the number kept claiming 30 / 23.
     HP has no floor: below zero is a real state, that is what a Death Check is for. */
  const hp = { current: Math.min(character.hp.current, hpTotal), max: hpTotal };
  const mp = { current: Math.max(0, Math.min(character.mp.current, mpTotal)), max: mpTotal };

  const tabs = TAB_IDS.filter((id) => id !== 'mounts' || hasMounts(character));
  const [requestedTab, setRequestedTab] = useState<TabId>('equipment');
  /* Derived, not stored: the roster switches characters without remounting this component,
     so the tab that was open can be one the new character has no use for (Mounts, for a
     character who does not ride). Falling back here rather than in an effect keeps the very
     first render right instead of flashing an empty panel. */
  const activeTab = tabs.includes(requestedTab) ? requestedTab : tabs[0];

  const [openDrawer, setOpenDrawer] = useState<DrawerId | null>(null);
  function toggleDrawer(id: DrawerId) {
    setOpenDrawer((current) => (current === id ? null : id));
  }

  function updateCurrent(field: 'hp' | 'mp', value: number) {
    const max = field === 'hp' ? hpTotal : mpTotal;
    const clamped = field === 'hp' ? Math.min(value, max) : Math.max(0, Math.min(value, max));
    update((c) => ({ ...c, [field]: { current: clamped } }));
  }

  function updateProfile(field: 'gender' | 'age', value: string) {
    update((c) => ({ ...c, profile: { ...c.profile, [field]: value } }));
  }

  /* The purse moved up here from the Equipment section: how much money is left is asked as
     often as how much HP is, and it was two clicks and a scroll away on the gear tab. The
     spending log stayed behind with the gear it paid for — a record, not a running total. */
  function setCurrency(field: 'cash' | 'savings' | 'debt', value: number) {
    update((c) => ({ ...c, currency: { ...c.currency, [field]: value } }));
  }


  /* The class-specific sections below render as <details data-collapsible>, collapsed on
     screen when the character doesn't use that system — most of what made the sheet feel
     bulky was a full empty card for each of the eight or nine a given character never
     touches. Paper doesn't get that convenience: the book's printed sheet leaves every one
     of these blank for the player to fill by hand, so a real print (or Ctrl+P, not just this
     button) forces every one open first and puts whatever the player had collapsed back the
     way it was afterward — a DOM property, not a CSS override, so it doesn't fight the
     display:contents trick `.subsection` already relies on for the same print pass.
     The tabs and the drawers need no such pass: both hide with a class the print stylesheet
     simply overrides, which is why neither unmounts its content. */
  useEffect(() => {
    function openForPrint() {
      for (const details of document.querySelectorAll<HTMLDetailsElement>('details[data-collapsible]')) {
        details.dataset.wasOpen = details.open ? '1' : '0';
        details.open = true;
      }
    }
    function restoreAfterPrint() {
      for (const details of document.querySelectorAll<HTMLDetailsElement>('details[data-collapsible]')) {
        details.open = details.dataset.wasOpen === '1';
        delete details.dataset.wasOpen;
      }
    }
    window.addEventListener('beforeprint', openForPrint);
    window.addEventListener('afterprint', restoreAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', openForPrint);
      window.removeEventListener('afterprint', restoreAfterPrint);
    };
  }, []);

  const fortitudeValue = fortitude(advLevel, vitMod) + sumModifiersForField(character.statusEffects, 'fortitude');
  const willpowerValue = willpower(advLevel, sprMod) + sumModifiersForField(character.statusEffects, 'willpower');
  const effectCount = character.statusEffects.length;

  return (
    <section className={styles.sheet}>
      <header className={styles.identity}>
        <div className={styles.identityTop}>
          <AvatarField character={character} />

          <div className={styles.identityMain}>
            <h2>{character.name}</h2>
            <p className={styles.meta}>
              {race?.name ?? character.raceId} · {character.background} · {t('sheet.adventurerLevel')} {advLevel}
            </p>

            <ul className={styles.classBadges}>
              {character.classes.map((classLevel) => (
                <li key={classLevel.classId} className={styles.classBadge}>
                  {getClass(classLevel.classId)?.name ?? classLevel.classId} {classLevel.level}
                </li>
              ))}
            </ul>

            {/* Racial abilities unlock at Adventurer Level 6 and 11, so the ones still out of
                reach are shown dimmed with their level rather than hidden. */}
            {racialAbilities.length > 0 && (
              <ul className={styles.racialAbilities} aria-label={t('sheet.racialAbilities')}>
                {racialAbilities.map((ability, index) => {
                  const locked = advLevel < ability.fromLevel;
                  return (
                    <li key={`${ability.name}-${index}`} className={locked ? styles.racialAbilityLocked : undefined}>
                      [{ability.name}]{ability.fromLevel > 0 ? ` Lv${ability.fromLevel}+` : ''}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Four panels' worth of sheet that used to be four more cards to scroll past.
              They are reachable from every tab because that is when they are needed: a
              status effect lands while the Equipment tab is open, notes get written while
              looking at spells. */}
          <div className={`${styles.identityActions} ${styles.controlRow}`}>
            <button type="button" onClick={() => toggleDrawer('status')} aria-pressed={openDrawer === 'status'}>
              {t('statusEffects.title')}
              {effectCount > 0 ? ` (${effectCount})` : ''}
            </button>
            <button type="button" onClick={() => toggleDrawer('classes')} aria-pressed={openDrawer === 'classes'}>
              {t('sheet.classes')}
            </button>
            <button type="button" onClick={() => toggleDrawer('notes')} aria-pressed={openDrawer === 'notes'}>
              {t('sheet.notes')}
            </button>
            <button type="button" onClick={() => window.print()}>
              {t('sheet.print')}
            </button>
          </div>
        </div>

        <div className={styles.vitals}>
          {/* The bars stay in the header — they are read every round — but editing moved
              into a panel with room for a damage/healing number. */}
          <button
            type="button"
            className={styles.gaugeButton}
            onClick={() => toggleDrawer('vitals')}
            aria-pressed={openDrawer === 'vitals'}
            aria-label={t('sheet.editVitals')}
          >
            <span className={styles.gaugeHead}>
              <span className={styles.gaugeLabel}>{t('sheet.hp')}</span>
              <span className={styles.gaugeValue}>
                <span className={styles.numeric}>{hp.current}</span>
                <span className={styles.gaugeMax}>/ {hp.max}</span>
              </span>
            </span>
            <span className={styles.track}>
              <span
                className={`${styles.fill} ${hpFillClass(hp.current, hp.max)}`}
                style={{ width: percent(hp.current, hp.max) }}
              />
            </span>
          </button>

          <button
            type="button"
            className={styles.gaugeButton}
            onClick={() => toggleDrawer('vitals')}
            aria-pressed={openDrawer === 'vitals'}
            aria-label={t('sheet.editVitals')}
          >
            <span className={styles.gaugeHead}>
              <span className={styles.gaugeLabel}>{t('sheet.mp')}</span>
              <span className={styles.gaugeValue}>
                <span className={styles.numeric}>{mp.current}</span>
                <span className={styles.gaugeMax}>/ {mp.max}</span>
              </span>
            </span>
            <span className={styles.track}>
              <span className={`${styles.fill} ${styles.mpFill}`} style={{ width: percent(mp.current, mp.max) }} />
            </span>
          </button>

          <div className={styles.saves}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('sheet.fortitude')}</span>
              <span className={styles.statValue} aria-label={t('sheet.fortitude')}>
                {fortitudeValue}
              </span>
              <DiceRoll modifier={fortitudeValue} label={t('sheet.fortitude')} />
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t('sheet.willpower')}</span>
              <span className={styles.statValue} aria-label={t('sheet.willpower')}>
                {willpowerValue}
              </span>
              <DiceRoll modifier={willpowerValue} label={t('sheet.willpower')} />
            </div>
          </div>

          <div className={styles.moneyInline} role="group" aria-label={t('sheet.currency')}>
            {MONEY_FIELDS.map((field) => (
              <label key={field.key} className={styles.moneyField}>
                <span>{t(field.label)}</span>
                <input
                  type="number"
                  value={character.currency[field.key]}
                  onChange={(event) => setCurrency(field.key, Number(event.target.value))}
                  aria-label={t(field.label)}
                />
              </label>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.rail}>
          <AbilitySection character={character} />
          <CombatStatsSection character={character} />
        </div>

        <div className={styles.panels}>
          <div className={`${styles.tabs} ${styles.controlRow}`} role="tablist" aria-label={t('sheet.tabsLabel')}>
            {tabs.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`sheet-tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`sheet-panel-${id}`}
                className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                onClick={() => setRequestedTab(id)}
              >
                {t(`sheet.tab.${id}`)}
              </button>
            ))}
          </div>

          {/* Every panel stays mounted; the inactive ones hide on `data-active`, not with
              the `hidden` attribute: print shows all five (see the print block in the CSS
              module) and `hidden` would win there too, while a half-filled row survives a
              trip to another tab either way. */}
          <Panel id="equipment" activeTab={activeTab}>
            <EquipmentSection character={character} />
          </Panel>

          <Panel id="combat" activeTab={activeTab}>
            <CombatFeatsSection character={character} />
            <SchoolsSection character={character} />
          </Panel>

          <Panel id="magic" activeTab={activeTab}>
            <SpellsSection character={character} />
            <EvocationsSection character={character} />
            <EssenceWeavingSection character={character} />
            <GeomancerSection character={character} />
          </Panel>

          <Panel id="skills" activeTab={activeTab}>
            <ArtsSection character={character} />
            <TacticianSection character={character} />
            <WorkSkillsSection character={character} />
          </Panel>

          {hasMounts(character) && (
            <Panel id="mounts" activeTab={activeTab}>
              <MountsSection character={character} />
            </Panel>
          )}
        </div>
      </div>

      <SheetDrawer
        open={openDrawer === 'vitals'}
        label={t('sheet.vitalsPanel')}
        onClose={() => setOpenDrawer(null)}
        printable={false}
      >
        <HpMpPanel hp={hp} mp={mp} onChange={updateCurrent} />
      </SheetDrawer>

      <SheetDrawer open={openDrawer === 'status'} label={t('statusEffects.title')} onClose={() => setOpenDrawer(null)}>
        <StatusEffectsSection character={character} />
      </SheetDrawer>

      <SheetDrawer open={openDrawer === 'classes'} label={t('sheet.classes')} onClose={() => setOpenDrawer(null)}>
        <ClassesSection character={character} />
      </SheetDrawer>

      <SheetDrawer open={openDrawer === 'notes'} label={t('sheet.notes')} onClose={() => setOpenDrawer(null)}>
        {/* Gender and age sat in the header and pushed the identity card taller for two
            fields nobody edits twice; they belong with the rest of who the character is. */}
        <section className={styles.section} aria-labelledby="section-profile">
          <div className={styles.sectionHead}>
            <h3 id="section-profile">{t('sheet.profile')}</h3>
          </div>
          <div className={styles.profileFields}>
            <label className={styles.profileField}>
              <span>{t('sheet.gender')}</span>
              <input
                value={character.profile.gender}
                onChange={(event) => updateProfile('gender', event.target.value)}
                aria-label={t('sheet.gender')}
              />
            </label>
            <label className={styles.profileField}>
              <span>{t('sheet.age')}</span>
              <input
                value={character.profile.age}
                onChange={(event) => updateProfile('age', event.target.value)}
                aria-label={t('sheet.age')}
              />
            </label>
          </div>
        </section>
        <NotesSection character={character} />
        <FellowSection character={character} />
      </SheetDrawer>
    </section>
  );
}

function Panel({ id, activeTab, children }: { id: TabId; activeTab: TabId; children: ReactNode }) {
  return (
    <div
      role="tabpanel"
      id={`sheet-panel-${id}`}
      aria-labelledby={`sheet-tab-${id}`}
      className={styles.panel}
      data-active={activeTab === id ? '' : undefined}
    >
      {children}
    </div>
  );
}
