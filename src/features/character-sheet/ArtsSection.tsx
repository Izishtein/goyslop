import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ART_CLASS_ID, getArt, listArtsByKind, type ArtDefinition, type ArtKind } from '../../data/arts';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { bardicPower, enhancerPower } from '../../lib/formulas/derived-stats';
import { skillCheckModifier } from '../../lib/formulas/status-effects';
import { mpAfterCast } from '../../lib/spellcasting';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownArt } from '../../types/character';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';
import { GameIcon } from '../../components/icons';

/** The duration codes the Technique table uses, in the order the book prints them. */
const DURATIONS = ['10s', '30s', '3min', '1h', 'instant'] as const;

const KINDS: ArtKind[] = ['technique', 'spellsong', 'finale'];

/** "Unless stated otherwise, a Technique costs 3 MP to activate" — Core Rulebook II p. 98; no Technique on the list states otherwise. */
export const TECHNIQUE_MP = 3;

function classLevel(character: Character, classId: string): number {
  return character.classes.filter((entry) => entry.classId === classId).reduce((max, entry) => Math.max(max, entry.level), 0);
}

/** A catalog entry becomes a sheet row by copying what the book prints; the note stays
 *  the player's, because the catalog carries no effect text. */
function rowFromCatalog(art: ArtDefinition): KnownArt {
  return {
    id: crypto.randomUUID(),
    kind: art.kind,
    name: art.name,
    requiredLevel: art.requiredLevel,
    duration: art.duration ?? '',
    preparation: art.preparation ?? false,
    singing: art.singing ?? false,
    pets: art.pets ?? '',
    effectCondition: art.effectCondition ?? '',
    rhythm: art.rhythm ?? '',
    flourish: art.flourish ?? 0,
    extraRhythm: art.extraRhythm ?? '',
    resistance: art.resistance ?? '',
    damageType: art.damageType ?? '',
    notes: '',
  };
}

function blankRow(kind: ArtKind): KnownArt {
  return {
    id: crypto.randomUUID(),
    kind,
    name: '',
    requiredLevel: 1,
    duration: '',
    preparation: false,
    singing: false,
    pets: '',
    effectCondition: '',
    rhythm: '',
    flourish: 0,
    extraRhythm: '',
    resistance: '',
    damageType: '',
    notes: '',
  };
}

export function ArtsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const enhancerLevel = classLevel(character, 'enhancer');
  const bardLevel = classLevel(character, 'bard');
  const intMod = abilityModifier(abilityTotal(character.abilities.INT));

  const techniques = character.arts.filter((art) => art.kind === 'technique');
  const spellsongs = character.arts.filter((art) => art.kind === 'spellsong');
  const finales = character.arts.filter((art) => art.kind === 'finale');

  // Two Minor classes own all of this, so a Fighter's sheet has no business carrying three
  // empty tables. Rows already recorded keep the section reachable after a class is dropped.
  const showTechniques = enhancerLevel > 0 || techniques.length > 0;
  const showBard = bardLevel > 0 || spellsongs.length > 0 || finales.length > 0;

  const availableKinds = KINDS.filter((kind) => (kind === 'technique' ? showTechniques : showBard));
  const [kind, setKind] = useState<ArtKind>('technique');
  const [artId, setArtId] = useState('');
  // Techniques used this session, newest last, with what each took from the pool and the stone.
  const [uses, setUses] = useState<{ id: string; art: KnownArt; before: number; after: number; fromStone: number }[]>([]);
  /** MP the next Technique takes from the mako stone (only one stone at a time, Core II p. 98). */
  const [stoneUse, setStoneUse] = useState(0);
  const stone = character.makoStone;
  const drawFor = (): number => Math.max(0, Math.min(stoneUse, stone, TECHNIQUE_MP));

  const activeKind = availableKinds.includes(kind) ? kind : (availableKinds[0] ?? 'technique');
  const known = new Set(character.arts.map((art) => art.name));
  const options = listArtsByKind(activeKind);
  const levelForKind = ART_CLASS_ID[activeKind] === 'bard' ? bardLevel : enhancerLevel;

  if (!showTechniques && !showBard) return null;

  function addFromCatalog() {
    const found = getArt(artId);
    if (!found) return;
    update((c) => ({ ...c, arts: [...c.arts, rowFromCatalog(found)] }));
    setArtId('');
  }

  function addBlank() {
    update((c) => ({ ...c, arts: [...c.arts, blankRow(activeKind)] }));
  }

  /** Using a Technique spends its 3 MP, partly from the stone when asked; without the MP it does nothing. */
  function applyTechnique(art: KnownArt) {
    const before = character.mp.current;
    const fromStone = drawFor();
    const left = mpAfterCast(before, TECHNIQUE_MP - fromStone);
    if (left === null) return;
    update((c) => ({ ...c, mp: { current: left }, makoStone: c.makoStone - fromStone }));
    setUses((list) => [...list, { id: crypto.randomUUID(), art, before, after: left, fromStone }]);
  }

  function undoLastUse() {
    const last = uses[uses.length - 1];
    if (!last) return;
    update((c) => ({ ...c, mp: { current: c.mp.current + (last.before - last.after) }, makoStone: c.makoStone + last.fromStone }));
    setUses((list) => list.slice(0, -1));
  }

  function updateArt(id: string, patch: Partial<KnownArt>) {
    update((c) => ({ ...c, arts: c.arts.map((art) => (art.id === id ? { ...art, ...patch } : art)) }));
  }

  function removeArt(id: string) {
    update((c) => ({ ...c, arts: c.arts.filter((art) => art.id !== id) }));
  }

  function setPerformance(patch: Partial<Character['performance']>) {
    update((c) => ({ ...c, performance: { ...c.performance, ...patch } }));
  }

  /* Booleans are selects, not checkboxes: print strips a control's appearance down to a
     value on a rule, which leaves a checkbox as an empty box on paper. */
  function yesNo(value: boolean, onChange: (next: boolean) => void, label: string, labels: [string, string] = [t('sheet.yes'), t('sheet.no')]) {
    return (
      <select value={value ? 'yes' : 'no'} onChange={(e) => onChange(e.target.value === 'yes')} aria-label={label}>
        <option value="yes">{labels[0]}</option>
        <option value="no">{labels[1]}</option>
      </select>
    );
  }

  function levelCell(art: KnownArt) {
    return (
      <input
        type="number"
        min={1}
        value={art.requiredLevel}
        onChange={(e) => updateArt(art.id, { requiredLevel: Number(e.target.value) })}
        aria-label={t('sheet.requiredLevel')}
      />
    );
  }

  function nameCell(art: KnownArt) {
    return <PrintableField value={art.name} onChange={(e) => updateArt(art.id, { name: e.target.value })} aria-label={t('sheet.name')} />;
  }

  function noteCell(art: KnownArt) {
    return <PrintableField value={art.notes} onChange={(e) => updateArt(art.id, { notes: e.target.value })} aria-label={t('sheet.artNote')} />;
  }

  function removeCell(art: KnownArt) {
    return (
      <button type="button" onClick={() => removeArt(art.id)} aria-label={`${art.name} ${t('sheet.remove')}`}>
        {t('sheet.remove')}
      </button>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="section-arts">
      <div className={styles.sectionHead}>
        <h3 id="section-arts"><GameIcon name="section.arts" />{t('sheet.arts')}</h3>
        <p className={styles.sectionNote}>
          {enhancerLevel > 0 && (
            <>
              {t('sheet.enhancerSv')}: <strong className={styles.numeric}>{enhancerPower(enhancerLevel, intMod) + skillCheckModifier(character.statusEffects)}</strong>
            </>
          )}
          {enhancerLevel > 0 && bardLevel > 0 && ' · '}
          {bardLevel > 0 && (
            <>
              {t('sheet.bardicPower')}: <strong className={styles.numeric}>{bardicPower(bardLevel, intMod) + skillCheckModifier(character.statusEffects)}</strong>
            </>
          )}
        </p>
      </div>

      {showTechniques && (
        <div className={styles.subsection} data-print-empty={techniques.length === 0 || undefined}>
          <h4 className={styles.subHead}>{t('sheet.techniques')}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.requiredLevel')}</th>
                  <th>{t('sheet.preparation')}</th>
                  <th>{t('sheet.duration')}</th>
                  <th>{t('sheet.artNote')}</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {techniques.map((art) => (
                  <tr key={art.id}>
                    <td>{nameCell(art)}</td>
                    <td>{levelCell(art)}</td>
                    <td>{yesNo(art.preparation, (next) => updateArt(art.id, { preparation: next }), t('sheet.preparation'), ['△', '—'])}</td>
                    <td>
                      <select value={art.duration} onChange={(e) => updateArt(art.id, { duration: e.target.value })} aria-label={t('sheet.duration')}>
                        <option value=""></option>
                        {DURATIONS.map((code) => (
                          <option key={code} value={code}>
                            {t(`sheet.duration_${code}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{noteCell(art)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => applyTechnique(art)}
                        disabled={TECHNIQUE_MP - drawFor() > character.mp.current}
                        title={TECHNIQUE_MP - drawFor() > character.mp.current ? t('sheet.notEnoughMp') : undefined}
                        aria-label={`${art.name} ${t('sheet.useTechnique', { mp: TECHNIQUE_MP })}`}
                      >
                        {t('sheet.useTechnique', { mp: TECHNIQUE_MP })}
                      </button>
                    </td>
                    <td>{removeCell(art)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`${styles.inlineRow} ${styles.controlRow}`}>
            <label>
              {t('sheet.makoStone')}{' '}
              <input
                type="number"
                min={0}
                value={stone}
                onChange={(e) => {
                  const points = Math.max(0, Math.floor(Number(e.target.value)) || 0);
                  update((c) => ({ ...c, makoStone: points }));
                  setStoneUse((use) => Math.min(use, points));
                }}
                style={{ width: '4.5em' }}
              />
            </label>
            {stone > 0 && (
              <label>
                {t('sheet.makoStoneUseTechnique')}{' '}
                <input
                  type="number"
                  min={0}
                  max={Math.min(stone, TECHNIQUE_MP)}
                  value={Math.min(stoneUse, stone)}
                  onChange={(e) => setStoneUse(Math.max(0, Math.floor(Number(e.target.value)) || 0))}
                  style={{ width: '4.5em' }}
                />
              </label>
            )}
          </div>
          {uses.length > 0 && (
            <div className={styles.turnLog} role="status" aria-live="polite" data-testid="technique-log">
              <h4>{t('sheet.techniqueLog')}</h4>
              <ul>
                {uses.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.art.name}</strong> —{' '}
                    {entry.fromStone > 0
                      ? t('sheet.castSpentStone', { mp: TECHNIQUE_MP, stone: entry.fromStone, before: entry.before, after: entry.after })
                      : t('sheet.castSpent', { mp: TECHNIQUE_MP, before: entry.before, after: entry.after })}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={undoLastUse}>
                {t('sheet.useUndo')}
              </button>
              <button type="button" onClick={() => setUses([])}>
                {t('sheet.castClear')}
              </button>
            </div>
          )}
        </div>
      )}

      {showBard && (
        <>
          <div className={styles.subsection}>
            <h4 className={styles.subHead}>{t('sheet.performance')}</h4>
            <div className={styles.money}>
              <label className={styles.moneyField}>
                <span>{t('sheet.pet')}</span>
                <input value={character.performance.pet} onChange={(e) => setPerformance({ pet: e.target.value })} aria-label={t('sheet.pet')} />
              </label>
              <label className={styles.moneyField}>
                <span>{t('sheet.rhythmNote')}</span>
                <input
                  type="number"
                  min={0}
                  value={character.performance.rhythmNote}
                  onChange={(e) => setPerformance({ rhythmNote: Number(e.target.value) })}
                  aria-label={t('sheet.rhythmNote')}
                />
              </label>
              <label className={styles.moneyField}>
                <span>{t('sheet.rhythmHeart')}</span>
                <input
                  type="number"
                  min={0}
                  value={character.performance.rhythmHeart}
                  onChange={(e) => setPerformance({ rhythmHeart: Number(e.target.value) })}
                  aria-label={t('sheet.rhythmHeart')}
                />
              </label>
            </div>
          </div>

          <div className={styles.subsection} data-print-empty={spellsongs.length === 0 || undefined}>
            <h4 className={styles.subHead}>{t('sheet.spellsongs')}</h4>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('sheet.name')}</th>
                    <th>{t('sheet.requiredLevel')}</th>
                    <th>{t('sheet.singing')}</th>
                    <th>{t('sheet.pets')}</th>
                    <th>{t('sheet.rhythm')}</th>
                    <th>{t('sheet.flourish')}</th>
                    <th>{t('sheet.extraRhythm')}</th>
                    <th>{t('sheet.effectCondition')}</th>
                    <th>{t('sheet.artNote')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {spellsongs.map((art) => (
                    <tr key={art.id}>
                      <td>{nameCell(art)}</td>
                      <td>{levelCell(art)}</td>
                      <td>{yesNo(art.singing, (next) => updateArt(art.id, { singing: next }), t('sheet.singing'))}</td>
                      <td>
                        <PrintableField value={art.pets} onChange={(e) => updateArt(art.id, { pets: e.target.value })} aria-label={t('sheet.pets')} />
                      </td>
                      <td>
                        <input value={art.rhythm} onChange={(e) => updateArt(art.id, { rhythm: e.target.value })} aria-label={t('sheet.rhythm')} />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={art.flourish}
                          onChange={(e) => updateArt(art.id, { flourish: Number(e.target.value) })}
                          aria-label={t('sheet.flourish')}
                        />
                      </td>
                      <td>
                        <input value={art.extraRhythm} onChange={(e) => updateArt(art.id, { extraRhythm: e.target.value })} aria-label={t('sheet.extraRhythm')} />
                      </td>
                      <td>
                        <input
                          value={art.effectCondition}
                          onChange={(e) => updateArt(art.id, { effectCondition: e.target.value })}
                          aria-label={t('sheet.effectCondition')}
                        />
                      </td>
                      <td>{noteCell(art)}</td>
                      <td>{removeCell(art)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.subsection} data-print-empty={finales.length === 0 || undefined}>
            <h4 className={styles.subHead}>{t('sheet.finales')}</h4>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('sheet.name')}</th>
                    <th>{t('sheet.requiredLevel')}</th>
                    <th>{t('sheet.rhythmCost')}</th>
                    <th>{t('sheet.resistance')}</th>
                    <th>{t('sheet.damageType')}</th>
                    <th>{t('sheet.artNote')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {finales.map((art) => (
                    <tr key={art.id}>
                      <td>{nameCell(art)}</td>
                      <td>{levelCell(art)}</td>
                      <td>
                        <input value={art.rhythm} onChange={(e) => updateArt(art.id, { rhythm: e.target.value })} aria-label={t('sheet.rhythmCost')} />
                      </td>
                      <td>
                        <input value={art.resistance} onChange={(e) => updateArt(art.id, { resistance: e.target.value })} aria-label={t('sheet.resistance')} />
                      </td>
                      <td>
                        <PrintableField value={art.damageType} onChange={(e) => updateArt(art.id, { damageType: e.target.value })} aria-label={t('sheet.damageType')} />
                      </td>
                      <td>{noteCell(art)}</td>
                      <td>{removeCell(art)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {character.arts.length === 0 && <p className={styles.empty}>{t('sheet.noArts')}</p>}

      {/* Selects are data elsewhere on the sheet, so this picker is marked as chrome for print. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        {availableKinds.length > 1 && (
          <select
            value={activeKind}
            onChange={(e) => {
              setKind(e.target.value as ArtKind);
              setArtId('');
            }}
            aria-label={t('sheet.artKind')}
          >
            {availableKinds.map((name) => (
              <option key={name} value={name}>
                {t(`sheet.${name}s`)}
              </option>
            ))}
          </select>
        )}
        <label htmlFor="add-art">{t('sheet.addArt')}</label>
        <select id="add-art" value={artId} onChange={(e) => setArtId(e.target.value)}>
          <option value="">{t('creation.selectPlaceholder')}</option>
          {[...new Set(options.map((art) => art.requiredLevel))].map((level) => (
            <optgroup
              key={level}
              // Kept visible above the class level, since a sheet is often filled in
              // ahead of a level-up — flagged rather than hidden, exactly like spells.
              label={`${t('sheet.levelRequired', { level })}${level > levelForKind ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
            >
              {options
                .filter((art) => art.requiredLevel === level)
                .map((art) => (
                  <option key={art.id} value={art.id} disabled={known.has(art.name)}>
                    {art.name}
                    {art.duration ? ` — ${t(`sheet.duration_${art.duration}`)}` : ''}
                    {art.rhythm ? ` — ${art.rhythm}` : ''}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <button type="button" onClick={addFromCatalog} disabled={!artId}>
          {t('sheet.addArtAction')}
        </button>
        <button type="button" onClick={addBlank}>
          {t('sheet.addCustomArt')}
        </button>
      </div>
    </section>
  );
}
