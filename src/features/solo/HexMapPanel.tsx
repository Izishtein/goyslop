import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Monster } from '../../data/monsters';
import { spawnMonster } from '../../lib/encounter';
import { calendarOf, encounterThreshold, forageModifier, rollFestivalEvent } from '../../lib/calendar';
import { addEntry, setActivePlace, setDay } from '../../lib/campaign';
import { generateDungeon, generateLair, generateSettlement } from '../../lib/dungeon';
import { addPatchFactions, factionsAt, rollFactionEvent, withFactions, type Faction, type FactionEvent } from '../../lib/factions';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import {
  BIOMES,
  canMoveTo,
  hexDistance,
  isPort,
  isWater,
  stepAboard,
  withMarket,
  expandMap,
  forage,
  generateHexMap,
  makeCamp,
  MAX_FATIGUE,
  restDay,
  withFatigueEffect,
  hexAt,
  hexKey,
  HEX_PLACE_LIMIT,
  journalPlaceFor,
  landmarkOutcome,
  moveParty,
  nextPatchCentre,
  packSize,
  pickMonster,
  setHexPlace,
  type Hex,
  type LandmarkOutcome,
} from '../../lib/hexmap';
import { activeCharacterIdAtom, charactersAtom, useUpdateCharacter } from '../../state/characters';
import { campaignAtom } from '../../state/campaign';
import { dungeonAtom } from '../../state/dungeon';
import { encounterAtom } from '../../state/encounter';
import { hexMapAtom } from '../../state/hexmap';
import { voyageAtom } from '../../state/voyage';
import { callShip, canLandAt, canSailTo, sailTo, setSail } from '../../lib/voyage';
import { GameIcon } from '../../components/icons';
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
const GLYPH: Record<string, string> = { landmark: '◆', settlement: '⌂', lair: '☠', dungeon: '▼', empty: '·', island: '▲', reef: '≋' };

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
  const [voyage, setVoyage] = useAtom(voyageAtom);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const { monsters, byId } = useMonsters();
  const [note, setNote] = useState('');
  const [wandering, setWandering] = useState<Wandering | null>(null);
  const [looked, setLooked] = useState<LandmarkOutcome | null>(null);
  const [force, setForce] = useState(false);
  const [festival, setFestival] = useState<{ day: number; event: number; logged: boolean } | null>(null);
  const [patrol, setPatrol] = useState<Faction | null>(null);
  const [events, setEvents] = useState<Record<number, FactionEvent>>({});
  const [logged, setLogged] = useState<Record<number, boolean>>({});

  const date = calendarOf(campaign.day);
  const character = characters.find((entry) => entry.id === activeId);
  const level = character ? Math.max(1, adventurerLevel(character.classes)) : 1;
  const here = hexAt(map, map.party.q, map.party.r);

  const updateCharacter = useUpdateCharacter(character?.id ?? '');
  // Fatigue is carried onto the open character as a status effect, so Accuracy, Evasion and the saves feel it.
  const fatigueName = t('solo.hex.fatigueEffect');
  useEffect(() => {
    if (!character) return;
    const next = withFatigueEffect(character.statusEffects, map.fatigue, fatigueName);
    if (next !== character.statusEffects) updateCharacter((c) => ({ ...c, statusEffects: withFatigueEffect(c.statusEffects, map.fatigue, fatigueName) }));
  }, [character, map.fatigue, fatigueName, updateCharacter]);

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

  /** The ship, when the party left it ashore: the one water hex it may step back onto. */
  const waiting = voyage && !voyage.wrecked && !voyage.aboard ? voyage.at : null;
  const aboard = !!voyage && !voyage.wrecked && voyage.aboard;
  const call = voyage && waiting ? callShip(voyage, map) : null;
  /** Boarding a ship that lies on a water hex next to the party: no day passes. */
  const boardable = (hex: Hex) => !!waiting && isWater(hex.biome) && hex.q === waiting.q && hex.r === waiting.r && hexDistance(map.party, hex) === 1;

  /** What a click on this hex would do: sail the ship, land from it, board it, or walk. */
  function reachableHex(hex: Hex): boolean {
    if (voyage && aboard) return (voyage.moves > 0 && canSailTo(map, voyage, hex.q, hex.r)) || canLandAt(map, voyage, hex.q, hex.r);
    return canMoveTo(map, hex.q, hex.r, waiting) || boardable(hex);
  }

  function sail(hex: Hex) {
    if (!voyage) return;
    const report = sailTo(voyage, map, hex.q, hex.r);
    if (!report.event) return;
    setMap(report.map);
    setVoyage(report.voyage);
    setLooked(null);
    setWandering(null);
    setNote(report.event === 'reef' ? t('solo.voyage.sailed.reef', { damage: report.reefDamage }) : report.event === 'port' ? t('solo.voyage.sailed.harbour') : '');
  }

  function move(hex: Hex) {
    if (aboard && voyage) {
      if (canSailTo(map, voyage, hex.q, hex.r)) return sail(hex);
      if (!canLandAt(map, voyage, hex.q, hex.r)) return;
    } else if (boardable(hex) && voyage) {
      const next = stepAboard(map, hex.q, hex.r);
      if (!next) return;
      setMap(next);
      setVoyage({ ...voyage, aboard: true });
      setNote(t('solo.voyage.boarded'));
      return;
    }
    if (!canMoveTo(map, hex.q, hex.r, aboard && voyage ? voyage.at : waiting)) return;
    const result = moveParty(map, hex.q, hex.r, Math.random, { force, encounterOn: encounterThreshold(date), ship: aboard && voyage ? voyage.at : waiting });
    if (!result) return;
    // stepping off a ship that lies at a beach: the ship stays where it is, the party is ashore
    if (aboard && voyage) setVoyage({ ...voyage, aboard: false });
    setMap(result.map);
    if (result.dayPassed) setCampaign((current) => setDay(current, current.day + result.days));
    setLooked(null);
    const entered = hexAt(result.map, hex.q, hex.r);
    if (result.map.followJournal && entered) followJournal(result.map, entered);
    const parts = [result.forded ? t(force ? 'solo.hex.fordedForced' : 'solo.hex.forded') : '', result.hungry ? t('solo.hex.hungry') : ''];
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

  /** Points the journal at a hex: its own name, or one made from what stands there and kept on the hex. */
  function followJournal(from: typeof map, hex: Hex) {
    const found = journalPlaceFor(from, hex, `${featureLabel(hex)} (${hex.q},${hex.r})`);
    if (!found) return;
    if (found.map !== from) setMap(found.map);
    setCampaign((current) => setActivePlace(current, found.place));
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
    const options = { level: map.level, monsters, biome: here.biome, place, guardian };
    if (here.feature.kind === 'lair') setDungeon(generateLair(options));
    else if (here.feature.kind === 'settlement') setDungeon(generateSettlement(here.feature.settlement ?? 'village', map.level, place));
    else setDungeon(generateDungeon(options));
    setNote(t('solo.hex.dungeonEntered'));
  }

  /** Puts out to sea from the harbour the party stands in: the ship lies at its quay, the party aboard. */
  function putToSea() {
    if (!here || voyage || !isPort(map, here)) return;
    setVoyage(setSail(here.feature.settlement === 'hamlet' ? 'boat' : 'cog', map.level, { q: here.q, r: here.r, settlement: here.feature.settlement }));
    setMap((current) => withMarket(current, here.q, here.r));
    setNote(t('solo.voyage.sailed.putOut'));
  }

  /** The ship left ashore sails herself to the coast beside the party; the days are the party's too (rations, calendar). */
  function callTheShip() {
    if (!voyage) return;
    const call = callShip(voyage, map);
    if (!call) return;
    setVoyage(call.voyage);
    setMap((current) => ({ ...withMarket(current, call.to.q, call.to.r), rations: Math.max(0, current.rations - call.days) }));
    setCampaign((current) => setDay(current, current.day + call.days));
    setNote([t('solo.voyage.shipCalled', { q: call.to.q, r: call.to.r, days: call.days }), map.rations < call.days ? t('solo.hex.hungry') : ''].filter(Boolean).join(' '));
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
  /** What stands on a hex, in words: the settlement's size, the landmark's name, or the kind of feature. */
  const featureLabel = (hex: Hex): string => {
    const feature = hex.feature;
    return feature.kind === 'settlement' && feature.settlement
      ? t(`solo.hex.settlements.${feature.settlement}`)
      : feature.kind === 'landmark' && feature.landmark
        ? t(`solo.hex.landmarks.${feature.landmark}`)
        : t(`solo.hex.features.${feature.kind}`);
  };
  const describeHex = (hex: Hex): string => {
    if (!hex.visited) return hex.seen ? t('solo.hex.seenOnly', { biome: t(`solo.hex.biomes.${hex.biome}`) }) : t('solo.hex.unknown');
    const what = featureLabel(hex);
    const holders = factionsAt(map.factions, hex.q, hex.r);
    const realm = holders.length > 0 ? ` — ${holders.map(factionName).join(' / ')}` : '';
    const river = hex.river ? ` — ${t(hex.feature.kind === 'settlement' ? 'solo.hex.riverBridge' : 'solo.hex.river')}` : '';
    return `${hex.place ? `«${hex.place}» — ` : ''}${t(`solo.hex.biomes.${hex.biome}`)}: ${what}${river}${realm}`;
  };

  return (
    <section className={styles.panel} aria-labelledby="solo-hex">
      <div className={styles.panelHead}>
        <h3 id="solo-hex"><GameIcon name="solo.hex" />{t('solo.hex.title')}</h3>
        <p className={styles.note}>{t('solo.hex.note')}</p>
      </div>

      <div className={styles.toolbar}>
        <button type="button" onClick={newMap} disabled={!monsters}>
          {map.hexes.length === 0 ? t('solo.hex.generate') : t('solo.hex.regenerate')}
        </button>
        {map.hexes.length > 0 && (
          <>
            <span className={styles.round}>{t('solo.hex.rations', { rations: map.rations })}</span>
            <button type="button" onClick={doForage} disabled={aboard}>
              {t('solo.hex.forage')}
            </button>
            <button type="button" onClick={() => rest(false)} disabled={aboard}>
              {t('solo.hex.rest')}
            </button>
            <button type="button" onClick={() => rest(true)} disabled={aboard}>
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
      {date.festival && (
        <p className={styles.note}>
          <button type="button" onClick={() => setFestival({ day: campaign.day, event: rollFestivalEvent(), logged: false })}>
            {t('solo.hex.festivalRoll')}
          </button>
          {festival && festival.day === campaign.day && (
            <>
              {' '}
              <span role="status">{t(`solo.hex.festivalEvents.${festival.event}`)}</span>{' '}
              <button
                type="button"
                disabled={festival.logged}
                onClick={() => {
                  setCampaign((current) =>
                    addEntry(current, { kind: 'scene', title: t(`solo.hex.festivals.${date.festival}`), text: t(`solo.hex.festivalEvents.${festival.event}`), scene: 0 }, crypto.randomUUID()),
                  );
                  setFestival({ ...festival, logged: true });
                }}
              >
                {t('solo.hex.festivalLog')}
              </button>
            </>
          )}
        </p>
      )}
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
            const reachable = reachableHex(hex);
            const ship = !!voyage && !voyage.wrecked && voyage.at.q === hex.q && voyage.at.r === hex.r;
            return (
              <g
                key={hexKey(hex.q, hex.r)}
                role="button"
                tabIndex={reachable ? 0 : -1}
                aria-label={`${describe(hex)}${party ? ` — ${t('solo.hex.youAreHere')}` : ''}${ship ? ` — ${t('solo.voyage.shipHere')}` : ''}`}
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
                {hex.seen && hex.river && <path d={`M ${x - 16} ${y + 8} q 8 -14 16 -2 t 16 -2`} className={styles.hexRiver} aria-hidden="true" />}
                <text x={x} y={y + 5} textAnchor="middle" aria-hidden="true">
                  {hex.visited ? GLYPH[hex.feature.kind] : hex.seen ? '' : '?'}
                </text>
                {hex.seen && factionsAt(map.factions, hex.q, hex.r).length > 0 && (
                  <text x={x} y={y + 22} textAnchor="middle" className={styles.hexRealm} aria-hidden="true">
                    {factionsAt(map.factions, hex.q, hex.r).map((faction) => faction.id).join('/')}
                  </text>
                )}
                {ship && (
                  <text x={x + 12} y={y - 8} textAnchor="middle" aria-hidden="true">
                    ⛵
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
            ⌂ {t('solo.hex.features.settlement')} · ◆ {t('solo.hex.features.landmark')} · ☠ {t('solo.hex.features.lair')} · ▼ {t('solo.hex.features.dungeon')} · ▲ {t('solo.hex.features.island')} · ≋ {t('solo.hex.features.reef')} · ~ {t('solo.hex.river')}
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
          <p className={styles.controls}>
            <label>
              {t('solo.hex.placeName')}{' '}
              <input
                type="text"
                value={here.place ?? ''}
                maxLength={HEX_PLACE_LIMIT}
                onChange={(e) => setMap((current) => setHexPlace(current, here.q, here.r, e.target.value))}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const label = here.feature.kind === 'empty' ? t(`solo.hex.biomes.${here.biome}`) : featureLabel(here);
                const named = journalPlaceFor(map, here, `${label} (${here.q},${here.r})`, true);
                if (!named) return;
                setMap(named.map);
                setCampaign((current) => setActivePlace(current, named.place));
              }}
            >
              {t('solo.hex.journalHere')}
            </button>
            <label className={styles.inline}>
              <input type="checkbox" checked={map.followJournal === true} onChange={(e) => setMap((current) => ({ ...current, followJournal: e.target.checked }))} />
              {t('solo.hex.journalFollows')}
            </label>
          </p>
          {here.feature.kind === 'landmark' && (
            <p>
              <button type="button" onClick={lookAround}>
                {t('solo.hex.lookAround')}
              </button>{' '}
              {looked && <span role="status">{t(`solo.hex.outcomes.${looked}`)}</span>}
            </p>
          )}
          {(here.feature.kind === 'dungeon' || here.feature.kind === 'lair' || here.feature.kind === 'settlement') && (
            <p>
              <button type="button" onClick={enterDungeon} disabled={!monsters || dungeon?.place === hexKey(here.q, here.r)}>
                {dungeon?.place === hexKey(here.q, here.r) ? t(`solo.hex.${here.feature.kind}Begun`) : t(`solo.hex.${here.feature.kind}Enter`)}
              </button>
            </p>
          )}
          {isPort(map, here) && (
            <p>
              <button type="button" onClick={putToSea} disabled={!!voyage}>
                {t('solo.voyage.sail')}
              </button>{' '}
              <span className={styles.note}>{voyage ? t('solo.voyage.underway') : t('solo.voyage.sailHint')}</span>
            </p>
          )}
          {call && (
            <p>
              <button type="button" onClick={callTheShip}>
                {t('solo.voyage.callShip', { days: call.days })}
              </button>{' '}
              <span className={styles.note}>{t('solo.voyage.callShipHint')}</span>
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
