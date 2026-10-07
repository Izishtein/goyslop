import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Monster } from '../../data/monsters';
import { spawnMonster } from '../../lib/encounter';
import { calendarOf, encounterThreshold, forageModifier } from '../../lib/calendar';
import { addEntry, setDay } from '../../lib/campaign';
import { generateDungeon } from '../../lib/dungeon';
import { addPatchFactions, factionsAt, rollFactionEvent, withFactions, type Faction, type FactionEvent } from '../../lib/factions';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import {
  BIOMES,
  canMoveTo,
  expandMap,
  forage,
  generateHexMap,
  makeCamp,
  MAX_FATIGUE,
  restDay,
  hexAt,
  hexKey,
  landmarkOutcome,
  moveParty,
  nextPatchCentre,
  packSize,
  pickMonster,
  type Hex,
  type LandmarkOutcome,
} from '../../lib/hexmap';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { campaignAtom } from '../../state/campaign';
import { dungeonAtom } from '../../state/dungeon';
import { encounterAtom } from '../../state/encounter';
import { hexMapAtom } from '../../state/hexmap';
import styles from './SoloView.module.css';
import { useMonsters } from './useMonsters';

const SIZE = 30;
const SQRT3 = Math.sqrt(3);
const center = (hex: { q: number; r: number }) => ({ x: SIZE * SQRT3 * (hex.q + hex.r / 2), y: SIZE * 1.5 * hex.r });
const corners = (x: number, y: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${(x + SIZE * Math.cos(angle)).toFixed(1)},${(y + SIZE * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');

/** One letter on a visited hex says what is there. */
const GLYPH: Record<string, string> = { landmark: '◆', settlement: '⌂', lair: '☠', dungeon: '▼', empty: '·' };

interface Wandering {
  monster: Monster;
  count: number;
}

/** An encounter in a hex a realm holds is, one time in three, a patrol of that realm instead of a monster. */
const PATROL_IN = 3;

export function HexMapPanel() {
  const { t } = useTranslation();
  const [map, setMap] = useAtom(hexMapAtom);
  const [campaign, setCampaign] = useAtom(campaignAtom);
  const setEncounter = useSetAtom(encounterAtom);
  const [dungeon, setDungeon] = useAtom(dungeonAtom);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const { monsters, byId } = useMonsters();
  const [note, setNote] = useState('');
  const [wandering, setWandering] = useState<Wandering | null>(null);
  const [looked, setLooked] = useState<LandmarkOutcome | null>(null);
  const [force, setForce] = useState(false);
  const [patrol, setPatrol] = useState<Faction | null>(null);
  const [events, setEvents] = useState<Record<number, FactionEvent>>({});
  const [logged, setLogged] = useState<Record<number, boolean>>({});

  const date = calendarOf(campaign.day);
  const character = characters.find((entry) => entry.id === activeId);
  const level = character ? Math.max(1, adventurerLevel(character.classes)) : 1;
  const here = hexAt(map, map.party.q, map.party.r);

  function newMap() {
    if (!monsters) return;
    setMap(withFactions(generateHexMap({ level, monsters }), monsters));
    setPatrol(null);
    setEvents({});
    setLogged({});
    setNote('');
    setWandering(null);
    setLooked(null);
  }

  function move(hex: Hex) {
    if (!canMoveTo(map, hex.q, hex.r)) return;
    const result = moveParty(map, hex.q, hex.r, Math.random, { force, encounterOn: encounterThreshold(date) });
    if (!result) return;
    setMap(result.map);
    if (result.dayPassed) setCampaign((current) => setDay(current, current.day + 1));
    setLooked(null);
    const entered = hexAt(result.map, hex.q, hex.r);
    const parts = [result.hungry ? t('solo.hex.hungry') : ''];
    setPatrol(null);
    const holders = entered ? factionsAt(result.map.factions, entered.q, entered.r) : [];
    if (result.encounter && holders.length > 0 && Math.floor(Math.random() * PATROL_IN) === 0) {
      setPatrol(holders[Math.floor(Math.random() * holders.length)]);
      setWandering(null);
      parts.push(t('solo.hex.patrolMet'));
    } else if (result.encounter && monsters && entered) {
      const monster = pickMonster(monsters, entered.biome, result.map.level);
      if (monster) {
        setWandering({ monster, count: packSize(monster, result.map.level) });
        parts.push(t('solo.hex.wanderingMet'));
      }
    } else {
      setWandering(null);
    }
    setNote(parts.filter(Boolean).join(' '));
  }

  function putOnTable(monster: Monster, count: number) {
    setEncounter((current) => {
      const labels = current.monsters.map((entry) => entry.label);
      const added = [] as ReturnType<typeof spawnMonster>[];
      for (let i = 0; i < count; i += 1) added.push(spawnMonster(monster, [...labels, ...added.map((entry) => entry.label)], crypto.randomUUID()));
      return { ...current, monsters: [...current.monsters, ...added] };
    });
  }

  function doForage() {
    const result = forage(map, Math.random, forageModifier(date.season));
    setMap(result.map);
    setCampaign((current) => setDay(current, current.day + 1));
    setNote(t('solo.hex.foraged', { found: result.found }));
  }

  /** The dungeon of the hex the party stands on: the one already begun there, or a new one guarded by the hex's own monster. */
  function enterDungeon() {
    if (!monsters || !here) return;
    const place = hexKey(here.q, here.r);
    if (dungeon?.place === place) return;
    const guardian = here.feature.monsterId && here.feature.count ? { monsterId: here.feature.monsterId, count: here.feature.count } : undefined;
    setDungeon(generateDungeon({ level: map.level, monsters, biome: here.biome, place, guardian }));
    setNote(t('solo.hex.dungeonEntered'));
  }

  /** Opens the next 19 hexes beyond the edge the party stands on. */
  function expand() {
    if (!monsters) return;
    const result = expandMap(map, { level, monsters });
    if (!result) return;
    setMap(addPatchFactions(result.map, result.added, monsters));
    setNote(t('solo.hex.expanded'));
  }

  /** A day of rest or camp: fatigue comes off, a ration goes, and out in the open something may find the fire. */
  function rest(camp: boolean) {
    const result = camp ? makeCamp(map) : restDay(map);
    setMap(result.map);
    setCampaign((current) => setDay(current, current.day + 1));
    setLooked(null);
    setPatrol(null);
    const parts = [camp ? t('solo.hex.camped') : t('solo.hex.rested'), result.hungry ? t('solo.hex.hungry') : ''];
    if (result.encounter && monsters && here) {
      const monster = pickMonster(monsters, here.biome, result.map.level);
      if (monster) {
        setWandering({ monster, count: packSize(monster, result.map.level) });
        parts.push(t('solo.hex.wanderingMet'));
      }
    } else {
      setWandering(null);
    }
    setNote(parts.filter(Boolean).join(' '));
  }

  function lookAround() {
    setLooked(landmarkOutcome(1 + Math.floor(Math.random() * 6)));
  }

  const factionName = (faction: Faction): string => {
    const seat = faction.seats[0];
    return `${t(`solo.hex.seats.${seat.kind}`)} (${seat.q},${seat.r})${faction.seats.length > 1 ? ` +${faction.seats.length - 1}` : ''}`;
  };
  const known = map.factions.filter((faction) => faction.seats.some((seat) => hexAt(map, seat.q, seat.r)?.seen));
  const factionById = new Map(map.factions.map((faction) => [faction.id, faction]));

  function rollEvent(faction: Faction) {
    setEvents((current) => ({ ...current, [faction.id]: rollFactionEvent() }));
    setLogged((current) => ({ ...current, [faction.id]: false }));
  }

  function logEvent(faction: Faction) {
    const event = events[faction.id];
    if (!event) return;
    const title = `${factionName(faction)}: ${t(`solo.hex.events.${event.event}`)}`;
    setCampaign((current) => addEntry(current, { kind: 'thread', title, text: t(`solo.hex.timing.${event.timing}`), scene: 0 }, crypto.randomUUID()));
    setLogged((current) => ({ ...current, [faction.id]: true }));
  }

  const resident = here?.feature.monsterId ? byId.get(here.feature.monsterId) : undefined;
  const xs = map.hexes.map((hex) => center(hex).x);
  const ys = map.hexes.map((hex) => center(hex).y);
  const box = map.hexes.length
    ? { x: Math.min(...xs) - SIZE, y: Math.min(...ys) - SIZE, w: Math.max(...xs) - Math.min(...xs) + 2 * SIZE, h: Math.max(...ys) - Math.min(...ys) + 2 * SIZE }
    : null;

  const describe = (hex: Hex): string => {
    if (hex.camp) return `${describeHex(hex)} — ${t('solo.hex.campHere')}`;
    return describeHex(hex);
  };
  const describeHex = (hex: Hex): string => {
    if (!hex.visited) return hex.seen ? t('solo.hex.seenOnly', { biome: t(`solo.hex.biomes.${hex.biome}`) }) : t('solo.hex.unknown');
    const feature = hex.feature;
    const what =
      feature.kind === 'settlement' && feature.settlement
        ? t(`solo.hex.settlements.${feature.settlement}`)
        : feature.kind === 'landmark' && feature.landmark
          ? t(`solo.hex.landmarks.${feature.landmark}`)
          : t(`solo.hex.features.${feature.kind}`);
    const holders = factionsAt(map.factions, hex.q, hex.r);
    const realm = holders.length > 0 ? ` — ${holders.map(factionName).join(' / ')}` : '';
    return `${t(`solo.hex.biomes.${hex.biome}`)}: ${what}${realm}`;
  };

  return (
    <section className={styles.panel} aria-labelledby="solo-hex">
      <div className={styles.panelHead}>
        <h3 id="solo-hex">{t('solo.hex.title')}</h3>
        <p className={styles.note}>{t('solo.hex.note')}</p>
      </div>

      <div className={styles.toolbar}>
        <button type="button" onClick={newMap} disabled={!monsters}>
          {map.hexes.length === 0 ? t('solo.hex.generate') : t('solo.hex.regenerate')}
        </button>
        {map.hexes.length > 0 && (
          <>
            <span className={styles.round}>{t('solo.hex.rations', { rations: map.rations })}</span>
            <button type="button" onClick={doForage}>
              {t('solo.hex.forage')}
            </button>
            <button type="button" onClick={() => rest(false)}>
              {t('solo.hex.rest')}
            </button>
            <button type="button" onClick={() => rest(true)}>
              {t('solo.hex.makeCamp')}
            </button>
            <label className={styles.inline}>
              <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} disabled={map.fatigue >= MAX_FATIGUE} />
              {t('solo.hex.forceMarch')}
            </label>
            <span className={styles.numeric} role="status">
              {t('solo.hex.fatigue', { fatigue: map.fatigue, max: MAX_FATIGUE })}
              {map.fatigue > 0 && ` · ${t('solo.hex.fatiguePenalty', { penalty: map.fatigue })}`}
              {map.fatigue >= MAX_FATIGUE && ` · ${t('solo.hex.exhausted')}`}
            </span>
            <button type="button" onClick={expand} disabled={!monsters || nextPatchCentre(map) === null} title={t('solo.hex.expandHint')}>
              {t('solo.hex.expand')}
            </button>
            <span className={styles.numeric}>{t('solo.hex.forLevel', { level: map.level })}</span>
          </>
        )}
      </div>

      <p className={styles.note}>
        {t('solo.hex.date', { year: date.year, month: date.month, day: date.dayOfMonth, season: t(`solo.hex.seasons.${date.season}`) })}
        {date.festival && ` · ${t(`solo.hex.festivals.${date.festival}`)}`}
        {date.fullMoon && ` · ${t('solo.hex.fullMoon')}`}
      </p>
      {map.hexes.length === 0 && <p className={styles.note}>{t('solo.hex.empty', { level })}</p>}
      {note && (
        <p className={styles.note} role="status">
          {note}
        </p>
      )}

      {box && (
        <svg className={styles.hexSvg} viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="group" aria-label={t('solo.hex.mapAria')}>
          {map.hexes.map((hex) => {
            const { x, y } = center(hex);
            const party = hex.q === map.party.q && hex.r === map.party.r;
            const reachable = canMoveTo(map, hex.q, hex.r);
            return (
              <g
                key={hexKey(hex.q, hex.r)}
                role="button"
                tabIndex={reachable ? 0 : -1}
                aria-label={`${describe(hex)}${party ? ` — ${t('solo.hex.youAreHere')}` : ''}`}
                aria-disabled={!reachable}
                className={styles.hexCell}
                data-biome={hex.seen ? hex.biome : 'unknown'}
                data-reachable={reachable || undefined}
                onClick={() => move(hex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    move(hex);
                  }
                }}
              >
                <polygon points={corners(x, y)} />
                <text x={x} y={y + 5} textAnchor="middle" aria-hidden="true">
                  {hex.visited ? GLYPH[hex.feature.kind] : hex.seen ? '' : '?'}
                </text>
                {hex.seen && factionsAt(map.factions, hex.q, hex.r).length > 0 && (
                  <text x={x} y={y + 22} textAnchor="middle" className={styles.hexRealm} aria-hidden="true">
                    {factionsAt(map.factions, hex.q, hex.r).map((faction) => faction.id).join('/')}
                  </text>
                )}
                {party && <circle cx={x} cy={y - 14} r={5} className={styles.hexParty} />}
              </g>
            );
          })}
        </svg>
      )}

      {box && (
        <ul className={styles.hexLegend} aria-label={t('solo.hex.legend')}>
          {BIOMES.map((biome) => (
            <li key={biome}>
              <span className={styles.hexSwatch} data-biome={biome} aria-hidden="true" /> {t(`solo.hex.biomes.${biome}`)}
            </li>
          ))}
          <li>
            ⌂ {t('solo.hex.features.settlement')} · ◆ {t('solo.hex.features.landmark')} · ☠ {t('solo.hex.features.lair')} · ▼ {t('solo.hex.features.dungeon')}
          </li>
        </ul>
      )}

      {map.hexes.length > 0 && (
        <div className={styles.factions}>
          <h4>{t('solo.hex.factions')}</h4>
          {known.length === 0 ? (
            <p className={styles.note}>{t('solo.hex.noFactionsKnown')}</p>
          ) : (
            <ul>
              {known.map((faction) => {
                const event = events[faction.id];
                const ties = map.relations.filter((entry) => entry.a === faction.id || entry.b === faction.id);
                return (
                  <li key={faction.id}>
                    <p>
                      <strong>
                        {faction.id}. {factionName(faction)}
                      </strong>{' '}
                      · {t('solo.hex.domain', { count: faction.domain.length })}
                      {faction.seats.some((seat) => seat.monsterId) && ` · ${byId.get(faction.seats.find((seat) => seat.monsterId)?.monsterId ?? '')?.name ?? ''}`}
                    </p>
                    {ties.length > 0 && (
                      <p className={styles.note}>
                        {ties
                          .map((entry) => {
                            const other = factionById.get(entry.a === faction.id ? entry.b : entry.a);
                            return other && known.includes(other) ? `${other.id}: ${t(`solo.hex.relations.${entry.relation}`)}` : null;
                          })
                          .filter(Boolean)
                          .join('; ')}
                      </p>
                    )}
                    <div className={styles.controls}>
                      <button type="button" onClick={() => rollEvent(faction)} aria-label={`${t('solo.hex.rollEvent')} — ${factionName(faction)}`}>
                        {t('solo.hex.rollEvent')}
                      </button>
                      {event && (
                        <>
                          <span role="status">
                            {t(`solo.hex.events.${event.event}`)} ({t(`solo.hex.timing.${event.timing}`)})
                          </span>
                          <button type="button" onClick={() => logEvent(faction)} disabled={logged[faction.id]}>
                            {logged[faction.id] ? t('solo.hex.logged') : t('solo.hex.toLog')}
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {map.factions.length > known.length && <p className={styles.note}>{t('solo.hex.unknownFactions', { count: map.factions.length - known.length })}</p>}
        </div>
      )}

      {patrol && (
        <div className={styles.report}>
          <p>{t('solo.hex.patrol', { name: factionName(patrol) })}</p>
        </div>
      )}

      {here && (
        <div className={styles.report}>
          <p>
            <strong>{t('solo.hex.youAreHere')}</strong> — {describe(here)}
          </p>
          {here.feature.kind === 'landmark' && (
            <p>
              <button type="button" onClick={lookAround}>
                {t('solo.hex.lookAround')}
              </button>{' '}
              {looked && <span role="status">{t(`solo.hex.outcomes.${looked}`)}</span>}
            </p>
          )}
          {here.feature.kind === 'dungeon' && (
            <p>
              <button type="button" onClick={enterDungeon} disabled={!monsters || dungeon?.place === hexKey(here.q, here.r)}>
                {dungeon?.place === hexKey(here.q, here.r) ? t('solo.hex.dungeonBegun') : t('solo.hex.enterDungeon')}
              </button>
            </p>
          )}
          {resident && here.feature.count && (
            <p>
              {t('solo.hex.resident', { count: here.feature.count, name: resident.name, level: resident.level })}{' '}
              <button type="button" onClick={() => putOnTable(resident, here.feature.count ?? 1)}>
                {t('solo.hex.putOnTable')}
              </button>
            </p>
          )}
        </div>
      )}

      {wandering && (
        <div className={styles.report}>
          <p>
            {t('solo.hex.wandering', { count: wandering.count, name: wandering.monster.name, level: wandering.monster.level })}{' '}
            <button type="button" onClick={() => putOnTable(wandering.monster, wandering.count)}>
              {t('solo.hex.putOnTable')}
            </button>
            <button type="button" onClick={() => setWandering(null)}>
              {t('solo.hex.avoid')}
            </button>
          </p>
        </div>
      )}
    </section>
  );
}
