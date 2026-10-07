import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ALL_MONSTER_CATEGORIES,
  COMMON_ABILITIES,
  formatValue,
  HUMANOID_RACES,
  HUMANOID_RULES,
  loadMonsters,
  type Monster,
  type MonsterSkill,
} from '../../data/monsters';
import styles from './ReferenceView.module.css';

/** "1+" for the variable-level template monsters, the plain number otherwise. */
const levelLabel = (monster: Monster) => `${monster.level}${monster.levelPlus ? '+' : ''}`;

/** Skills of a multi-section monster are listed under the body section they belong to. */
function groupBySection(skills: MonsterSkill[]): { section: string; skills: MonsterSkill[] }[] {
  const groups: { section: string; skills: MonsterSkill[] }[] = [];
  for (const skill of skills) {
    const section = skill.section ?? '';
    const last = groups.at(-1);
    if (last && last.section === section) last.skills.push(skill);
    else groups.push({ section, skills: [skill] });
  }
  return groups;
}

function SkillList({ skills }: { skills: MonsterSkill[] }) {
  return (
    <div className={styles.monsterSkills}>
      {skills.map((skill, index) => (
        <div key={`${skill.name}-${index}`}>
          {skill.name && (
            <p className={styles.monsterSkillName}>
              {skill.icons && <span aria-hidden="true">{skill.icons} </span>}
              {skill.name}
            </p>
          )}
          {skill.text.map((line, lineIndex) => (
            <p key={lineIndex} className={styles.monsterProse}>
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

/** What the book prints once for a whole classification and leaves out of its cards. */
function CommonAbilities({ category }: { category: string }) {
  const { t } = useTranslation();
  const groups = COMMON_ABILITIES[category];
  if (!groups) return null;
  return (
    <details className={styles.monsterCommon}>
      <summary>{t('reference.monsters.commonAbilities', { category: t(`reference.monsters.categories.${category}`) })}</summary>
      {groups.map((group) => (
        <div key={group.title}>
          <h5>{group.title}</h5>
          {group.intro?.map((line) => (
            <p key={line} className={styles.monsterProse}>
              {line}
            </p>
          ))}
          <SkillList skills={group.skills} />
        </div>
      ))}
    </details>
  );
}

/** Humanoid cards assume a Human; this is the book's table for every other race. */
function HumanoidRaces() {
  const { t } = useTranslation();
  return (
    <details className={styles.monsterCommon}>
      <summary>{t('reference.monsters.humanoidRaces')}</summary>
      {HUMANOID_RULES.map((line) => (
        <p key={line} className={styles.monsterProse}>
          {line}
        </p>
      ))}
      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label={t('reference.monsters.humanoidRaces')}>
          <thead>
            <tr>
              <th>{t('reference.monsters.race')}</th>
              <th>{t('reference.monsters.dataModification')}</th>
              <th>{t('reference.monsters.uniqueSkills')}</th>
            </tr>
          </thead>
          <tbody>
            {HUMANOID_RACES.map((race) => (
              <tr key={race.id}>
                <th scope="row" className={styles.rowName}>
                  {t(`reference.monsters.races.${race.id}`)}
                </th>
                <td>
                  {race.perception && (
                    <span>
                      {t('reference.monsters.perception')}: {race.perception}.{' '}
                    </span>
                  )}
                  {race.modification}
                  {race.note && <em> — {race.note}</em>}
                </td>
                <td>
                  {race.skills.length === 0
                    ? t('reference.monsters.noSkills')
                    : race.skills.map((skill) => (
                        <p key={skill.name} className={styles.monsterProse}>
                          <strong>
                            {skill.icons} {skill.name}
                          </strong>{' '}
                          {skill.text}
                          {skill.level6 && ' (' + t('reference.monsters.level6') + ': ' + skill.level6 + ')'}
                          {skill.level11 && ' (' + t('reference.monsters.level11') + ': ' + skill.level11 + ')'}
                        </p>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function MonsterCard({ monster }: { monster: Monster }) {
  const { t } = useTranslation();
  const groups = groupBySection(monster.skills);

  return (
    <article className={styles.monsterCard} aria-label={monster.name}>
      {monster.material && (
        <p className={styles.monsterTraits}>
          <span>
            {t('reference.monsters.material')}: {monster.material}
          </span>
        </p>
      )}
      <p className={styles.monsterTraits}>
        <span>
          {t('reference.monsters.intelligence')}: {monster.intelligence}
        </span>
        <span>
          {t('reference.monsters.perception')}: {monster.perception}
        </span>
        <span>
          {t('reference.monsters.disposition')}: {monster.disposition}
        </span>
        {monster.soulscars !== undefined && (
          <span>
            {t('reference.monsters.soulscars')}: {monster.soulscars}
          </span>
        )}
        <span>
          {t('reference.monsters.language')}: {monster.language}
        </span>
        <span>
          {t('reference.monsters.habitat')}: {monster.habitat}
        </span>
      </p>
      <p className={styles.monsterTraits}>
        <span>
          {t('reference.monsters.repWeak')}: {monster.reputation ?? '–'} / {monster.weakness ?? '–'}
          {monster.reputationNote ? ` (${monster.reputationNote})` : ''}
        </span>
        <span>
          {t('reference.monsters.weakPoint')}: {monster.weakPoint}
        </span>
        <span>
          {t('reference.monsters.initiative')}: {monster.initiative}
        </span>
        <span>
          {t('reference.monsters.movement')}: {monster.movement}
        </span>
        <span>
          {t('reference.monsters.fortitude')}: {formatValue(monster.fortitude)}
        </span>
        <span>
          {t('reference.monsters.willpower')}: {formatValue(monster.willpower)}
        </span>
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label={t('reference.monsters.statBlock')}>
          <thead>
            <tr>
              <th>{t('reference.monsters.style')}</th>
              <th>{t('reference.monsters.accuracy')}</th>
              <th>{t('reference.monsters.damage')}</th>
              <th>{t('reference.monsters.evasion')}</th>
              <th>{t('reference.monsters.defense')}</th>
              <th>HP</th>
              <th>MP</th>
            </tr>
          </thead>
          <tbody>
            {monster.sections.map((section, index) => (
              <tr key={`${section.style}-${index}`}>
                <th scope="row" className={styles.rowName}>
                  {section.style}
                </th>
                <td className={styles.numeric}>{formatValue(section.accuracy)}</td>
                <td className={styles.numeric}>{section.damage ?? '–'}</td>
                <td className={styles.numeric}>{formatValue(section.evasion)}</td>
                <td className={styles.numeric}>{section.defense ?? '–'}</td>
                <td className={styles.numeric}>{section.hp ?? '–'}</td>
                <td className={styles.numeric}>{section.mp ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {monster.sectionsNote && <p className={styles.note}>{monster.sectionsNote}</p>}

      <h5>{t('reference.monsters.uniqueSkills')}</h5>
      {groups.length === 0 ? (
        <p className={styles.note}>{t('reference.monsters.noSkills')}</p>
      ) : (
        groups.map((group, groupIndex) => (
          <div key={`${group.section}-${groupIndex}`} className={styles.monsterSkills}>
            {group.section && <h6>{group.section}</h6>}
            {group.skills.map((skill, index) => (
              <div key={`${skill.name}-${index}`}>
                {skill.name && (
                  <p className={styles.monsterSkillName}>
                    {skill.icons && <span aria-hidden="true">{skill.icons} </span>}
                    {skill.name}
                  </p>
                )}
                {skill.text.map((line, lineIndex) => (
                  <p key={lineIndex} className={styles.monsterProse}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))
      )}

      {monster.enhancements && monster.enhancements.entries.length > 0 && (
        <>
          <h5>
            {t('reference.monsters.enhancing')}
            {monster.enhancements.max !== null && ' — ' + t('reference.monsters.enhancingMax', { max: monster.enhancements.max })}
          </h5>
          <div className={styles.monsterSkills}>
            {monster.enhancements.entries.map((entry, index) => (
              <p key={index} className={styles.monsterEnhancing}>
                {entry}
              </p>
            ))}
          </div>
        </>
      )}

      {monster.loot.length > 0 && (
        <>
          <h5>{t('reference.monsters.loot')}</h5>
          <div className={styles.tableWrap}>
            <table className={styles.table} aria-label={t('reference.monsters.loot')}>
              <thead>
                <tr>
                  <th>2d6</th>
                  <th>{t('reference.monsters.lootItem')}</th>
                </tr>
              </thead>
              <tbody>
                {monster.loot.map((row, index) => (
                  <tr key={index}>
                    <td className={styles.numeric}>{row.roll}</td>
                    <td>{row.item}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {monster.description.length > 0 && (
        <>
          <h5>{t('reference.monsters.description')}</h5>
          {monster.description.map((paragraph, index) => (
            <p key={index} className={styles.monsterProse}>
              {paragraph}
            </p>
          ))}
        </>
      )}
    </article>
  );
}

export function MonstersReference() {
  const { t } = useTranslation();
  const [monsters, setMonsters] = useState<Monster[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [maxLevel, setMaxLevel] = useState('');
  const [openId, setOpenId] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadMonsters()
      .then((loaded) => !cancelled && setMonsters(loaded))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    const low = minLevel === '' ? -Infinity : Number(minLevel);
    const high = maxLevel === '' ? Infinity : Number(maxLevel);
    return (monsters ?? []).filter(
      (monster) =>
        (!category || monster.category === category) &&
        monster.level >= low &&
        monster.level <= high &&
        (!query || monster.name.toLowerCase().includes(query) || monster.habitat.toLowerCase().includes(query)),
    );
  }, [monsters, search, category, minLevel, maxLevel]);

  return (
    <section className={styles.panel} aria-labelledby="reference-monsters">
      <div className={styles.panelHead}>
        <h3 id="reference-monsters">{t('reference.tab.monsters')}</h3>
        <p className={styles.note}>{t('reference.monstersNote')}</p>
      </div>

      <div className={`${styles.controlRow} ${styles.monsterFilters}`}>
        <label>
          {t('reference.monsters.search')}
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('reference.monsters.searchHint')} />
        </label>
        <label>
          {t('reference.monsters.category')}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t('reference.monsters.allCategories')}</option>
            {ALL_MONSTER_CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {t(`reference.monsters.categories.${name}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('reference.monsters.levelFrom')}
          <input type="number" min={0} value={minLevel} onChange={(e) => setMinLevel(e.target.value)} />
        </label>
        <label>
          {t('reference.monsters.levelTo')}
          <input type="number" min={0} value={maxLevel} onChange={(e) => setMaxLevel(e.target.value)} />
        </label>
      </div>

      {category && <CommonAbilities category={category} />}
      {category === 'Humanoids' && <HumanoidRaces />}

      {failed && <p className={styles.missing}>{t('reference.monsters.loadFailed')}</p>}
      {!monsters && !failed && <p className={styles.note}>{t('reference.monsters.loading')}</p>}

      {monsters && (
        <>
          <p className={styles.note} role="status">
            {t('reference.monsters.count', { shown: shown.length, total: monsters.length })}
          </p>
          <ul className={styles.monsterList}>
            {shown.map((monster) => {
              const open = openId === monster.id;
              return (
                <li key={monster.id}>
                  <button
                    type="button"
                    className={styles.monsterRow}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? '' : monster.id)}
                  >
                    <span className={styles.monsterLevel}>{levelLabel(monster)}</span>
                    <span className={styles.monsterName}>{monster.name}</span>
                    <span className={styles.monsterMeta}>
                      {t(`reference.monsters.categories.${monster.category}`)} · {monster.habitat}
                    </span>
                    <span className={styles.monsterSource}>{monster.source}</span>
                  </button>
                  {open && <MonsterCard monster={monster} />}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
