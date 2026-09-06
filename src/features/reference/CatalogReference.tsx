import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ABYSS_CURSES, enhancementsFor, type AbyssTarget } from '../../data/abyss';
import { listArtsByKind, type ArtKind } from '../../data/arts';
import { COMBAT_FEATS } from '../../data/combat-feats';
import { CONSUMABLE_PRESETS } from '../../data/consumables';
import { CATALOGUED_SCHOOLS, listSpellsBySchool } from '../../data/spells';
import { COMBAT_FEAT_CATEGORIES } from '../../types/character';
import styles from './ReferenceView.module.css';

export function SpellsReference() {
  const { t } = useTranslation();
  const [school, setSchool] = useState(CATALOGUED_SCHOOLS[0]);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const all = listSpellsBySchool(school);
  const spells = query ? all.filter((spell) => spell.name.toLowerCase().includes(query)) : all;

  return (
    <section className={styles.panel} aria-labelledby="reference-spells">
      <div className={styles.panelHead}>
        <h3 id="reference-spells">{t('reference.tab.spells')}</h3>
        <p className={styles.note}>{t('reference.spellsNote')}</p>
      </div>

      <div className={styles.controlRow}>
        <label htmlFor="reference-school">{t('sheet.spellSchool')}</label>
        <select id="reference-school" value={school} onChange={(event) => setSchool(event.target.value)}>
          {CATALOGUED_SCHOOLS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <label htmlFor="reference-spell-search">{t('sheet.searchSpells')}</label>
        <input id="reference-spell-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {spells.length === 0 ? (
        <p className={styles.missing}>{t('sheet.searchNoMatch')}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.spellName')}</th>
                <th>{t('sheet.spellCircle')}</th>
                <th>{t('sheet.spellMp')}</th>
                <th>{t('reference.book')}</th>
              </tr>
            </thead>
            <tbody>
              {spells.map((spell) => (
                <tr key={spell.id}>
                  <th scope="row" className={styles.rowName}>
                    {spell.name}
                    {spell.deity ? ` (${spell.deity})` : ''}
                    {spell.magisphere ? ` (${spell.magisphere})` : ''}
                    {spell.fairyType ? ` (${spell.fairyType})` : ''}
                  </th>
                  <td className={styles.numeric}>{spell.circle}</td>
                  <td className={styles.numeric}>{spell.mp ?? '?'}</td>
                  <td>{spell.sourceBook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function CombatFeatsReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-feats">
      <div className={styles.panelHead}>
        <h3 id="reference-feats">{t('reference.tab.feats')}</h3>
        <p className={styles.note}>{t('reference.featsNote')}</p>
      </div>

      {COMBAT_FEAT_CATEGORIES.map((category) => (
        <div key={category} className={styles.group}>
          <h4>{t(`sheet.combatFeatCategory.${category}`)}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('reference.book')}</th>
                </tr>
              </thead>
              <tbody>
                {COMBAT_FEATS.filter((feat) => feat.category === category).map((feat) => (
                  <tr key={feat.id}>
                    <th scope="row" className={styles.rowName}>
                      {feat.name}
                    </th>
                    <td>{feat.sourceBook}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

/** The order the book introduces them: the Enhancer's, then the Bard's two. */
const ART_KINDS: ArtKind[] = ['technique', 'spellsong', 'finale'];

export function ArtsReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-arts">
      <div className={styles.panelHead}>
        <h3 id="reference-arts">{t('reference.tab.arts')}</h3>
        <p className={styles.note}>{t('reference.artsNote')}</p>
      </div>

      {ART_KINDS.map((kind) => (
        <div key={kind} className={styles.group}>
          <h4>{t(`sheet.${kind}s`)}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.requiredLevel')}</th>
                  {kind === 'technique' && <th>{t('sheet.preparation')}</th>}
                  {kind === 'technique' && <th>{t('sheet.duration')}</th>}
                  {kind !== 'technique' && <th>{kind === 'finale' ? t('sheet.rhythmCost') : t('sheet.rhythm')}</th>}
                  {kind === 'spellsong' && <th>{t('sheet.flourish')}</th>}
                  {kind === 'spellsong' && <th>{t('sheet.pets')}</th>}
                  {kind !== 'technique' && <th>{t('sheet.resistance')}</th>}
                  {kind !== 'technique' && <th>{t('sheet.damageType')}</th>}
                </tr>
              </thead>
              <tbody>
                {listArtsByKind(kind).map((art) => (
                  <tr key={art.id}>
                    <th scope="row" className={styles.rowName}>
                      {art.name}
                    </th>
                    <td className={styles.numeric}>{art.requiredLevel}</td>
                    {kind === 'technique' && <td>{art.preparation ? '△' : '—'}</td>}
                    {kind === 'technique' && <td>{art.duration ? t(`sheet.duration_${art.duration}`) : '—'}</td>}
                    {kind !== 'technique' && <td>{art.rhythm}</td>}
                    {kind === 'spellsong' && <td className={styles.numeric}>{art.flourish}</td>}
                    {kind === 'spellsong' && <td>{art.pets}</td>}
                    {kind !== 'technique' && <td>{art.resistance}</td>}
                    {kind !== 'technique' && <td>{art.damageType}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

const ABYSS_TARGETS: AbyssTarget[] = ['weapon', 'armor', 'shield'];

export function ItemsReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-items">
      <div className={styles.panelHead}>
        <h3 id="reference-items">{t('reference.tab.items')}</h3>
        <p className={styles.note}>{t('reference.itemsNote')}</p>
      </div>

      <div className={styles.group}>
        <h4>{t('sheet.abyssEnhancement')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.enhancementTarget')}</th>
                <th>{t('sheet.abyssType')}</th>
              </tr>
            </thead>
            <tbody>
              {ABYSS_TARGETS.map((target) => (
                <tr key={target}>
                  <th scope="row" className={styles.rowName}>
                    {t(`reference.target_${target}`)}
                  </th>
                  <td>{enhancementsFor(target).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('sheet.abyssCurse')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('reference.roll2d')}</th>
                <th>{t('sheet.name')}</th>
              </tr>
            </thead>
            <tbody>
              {ABYSS_CURSES.map((curse) => (
                <tr key={curse.roll}>
                  <th scope="row" className={styles.numeric}>
                    {curse.roll}
                  </th>
                  <td>{curse.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.group}>
        <h4>{t('reference.consumables')}</h4>
        <p>{CONSUMABLE_PRESETS.join(' · ')}</p>
      </div>
    </section>
  );
}
