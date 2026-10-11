import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isValuePair } from '../../data/monsters';
import { spawnMonster } from '../../lib/encounter';
import { breakAway, grapple, ourVolley, takePrize, theirVolley } from '../../lib/boarding';
import { addEntry, setDay } from '../../lib/campaign';
import { generateSettlement } from '../../lib/dungeon';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { upsertManagedEffect } from '../../lib/formulas/status-effects';
import { hexDistance, landfall, PENALTY_FIELDS, SETTLEMENT_KINDS, type SettlementKind } from '../../lib/hexmap';
import { canSailTo, seaHexAt, type SeaHex } from '../../lib/seamap';
import { FLEET_MAX, GOODS, HIRE_FEE, SHIP_PRICE, goodPrice } from '../../lib/ships';
import {
  addShip,
  attackShip,
  cargoCapacity,
  cargoLoad,
  claimPrize,
  crewAboard,
  crewModifier,
  crewNeeded,
  dayInPort,
  fleetOf,
  harbourHere,
  hireCrew,
  loadGoods,
  loseCrew,
  unloadGoods,
  type Voyage,
  exploreIsland,
  HULL,
  HUNGER_MAX,
  hullBlow,
  inPort,
  repairDay,
  sailDay,
  sailTo,
  setSail,
  SHIPS,
  type Ship,
  type ShipAttack,
  undermanned,
} from '../../lib/voyage';
import { activeCharacterIdAtom, charactersAtom, useUpdateCharacter } from '../../state/characters';
import { campaignAtom } from '../../state/campaign';
import { dungeonAtom } from '../../state/dungeon';
import { hexMapAtom } from '../../state/hexmap';
import { encounterAtom } from '../../state/encounter';
import { voyageAtom } from '../../state/voyage';
import styles from './SoloView.module.css';
import { useMonsters } from './useMonsters';

const SIZE = 24;
const SQRT3 = Math.sqrt(3);
const center = (hex: { q: number; r: number }) => ({ x: SIZE * SQRT3 * (hex.q + hex.r / 2), y: SIZE * 1.5 * hex.r });
const corners = (x: number, y: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${(x + SIZE * Math.cos(angle)).toFixed(1)},${(y + SIZE * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');

const GLYPH: Record<string, string> = { water: '', port: '⚓', island: '▲', reef: '≋' };
/** Ids of the status effects the voyage lays on the open character. */
const HUNGER_EFFECT_ID = 'voyage-hunger';
const DECK_EFFECT_ID = 'voyage-deck';
/** A storm pitches the deck: -2 to Accuracy and Evasion while it lasts. */
const DECK_PENALTY = 2;

/**
 * Sailing from port to port on a chart of water hexes: the day's weather sets how many hexes the ship may sail,
 * reefs tear the hull, islands can be searched, harbours refill the hold. Sea monsters can be put on the table or
 * set on the ship itself, an empty hold wears the crew down, and a storm pitches the deck under the open character.
 */
export function VoyagePanel() {
  const { t } = useTranslation();
  const [voyage, writeVoyage] = useAtom(voyageAtom);
  const setEncounter = useSetAtom(encounterAtom);
  const setCampaign = useSetAtom(campaignAtom);
  const setDungeon = useSetAtom(dungeonAtom);
  const setHexMap = useSetAtom(hexMapAtom);
  const [landing, setLanding] = useState(false);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const updateCharacter = useUpdateCharacter(activeId ?? '');
  const { monsters, byId } = useMonsters();
  const [ship, setShip] = useState<Ship>('cog');
  const [blow, setBlow] = useState('2');
  const [fixed, setFixed] = useState(false);
  const [logged, setLogged] = useState(false);
  const [note, setNote] = useState('');
  const [strike, setStrike] = useState<ShipAttack | null>(null);
  const [target, setTarget] = useState(0);
  const [shipToBuy, setShipToBuy] = useState<Ship>('boat');
  const [fightLog, setFightLog] = useState<string[]>([]);

  const character = characters.find((entry) => entry.id === activeId);
  const level = character ? Math.max(1, adventurerLevel(character.classes)) : 1;
  const over = !!voyage && (voyage.arrived || voyage.wrecked);
  const cash = character?.currency.cash ?? 0;

  /** Every voyage day is a day of the campaign calendar. */
  function setVoyage(next: Voyage | null) {
    if (voyage && next && next.day > voyage.day) {
      const days = next.day - voyage.day;
      setCampaign((current) => setDay(current, current.day + days));
    }
    writeVoyage(next);
  }

  function pay(delta: number) {
    if (activeId) updateCharacter((c) => ({ ...c, currency: { ...c.currency, cash: Math.max(0, c.currency.cash + delta) } }));
  }

  // Hunger and a pitching deck are carried onto the open character as status effects, and lifted when they pass.
  const hunger = voyage && !over ? voyage.hunger : 0;
  const stormy = !!voyage && !over && voyage.weather === 'storm';
  const hungerName = t('solo.voyage.hungerEffect');
  const deckName = t('solo.voyage.deckEffect');
  useEffect(() => {
    if (!character) return;
    const apply = (effects: typeof character.statusEffects) => {
      const withHunger = upsertManagedEffect(effects, HUNGER_EFFECT_ID, hungerName, 'voyage', hunger > 0 ? PENALTY_FIELDS.map((field) => ({ field, value: -hunger })) : []);
      return upsertManagedEffect(
        withHunger,
        DECK_EFFECT_ID,
        deckName,
        'voyage',
        stormy
          ? [
              { field: 'accuracy', value: -DECK_PENALTY },
              { field: 'evasion', value: -DECK_PENALTY },
            ]
          : [],
      );
    };
    if (apply(character.statusEffects) !== character.statusEffects) updateCharacter((c) => ({ ...c, statusEffects: apply(c.statusEffects) }));
  }, [character, hunger, stormy, hungerName, deckName, updateCharacter]);

  if (!voyage) {
    return (
      <section className={styles.panel} aria-labelledby="solo-voyage">
        <div className={styles.panelHead}>
          <h3 id="solo-voyage">{t('solo.voyage.title')}</h3>
          <p className={styles.note}>{t('solo.voyage.note')}</p>
        </div>
        <div className={styles.toolbar}>
          <label>
            {t('solo.voyage.ship')}
            <select value={ship} onChange={(event) => setShip(event.target.value as Ship)}>
              {SHIPS.map((entry) => (
                <option key={entry} value={entry}>
                  {t(`solo.voyage.ships.${entry}`, { hull: HULL[entry] })}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setVoyage(setSail(ship, level));
              setLogged(false);
              setNote('');
              setStrike(null);
            }}
          >
            {t('solo.voyage.setSail')}
          </button>
          <span className={styles.numeric}>{t('solo.dungeon.forLevel', { level })}</span>
        </div>
      </section>
    );
  }

  const monster = voyage.encounter ? byId.get(voyage.encounter.monsterId) : undefined;
  const pursuit = voyage.pursuit;
  const crew = pursuit ? byId.get(pursuit.crewId) : undefined;
  const fleet = fleetOf(voyage);
  const aimed = Math.min(target, fleet.length - 1);
  const harbour = harbourHere(voyage);
  const hunted = !!pursuit && (pursuit.state === 'closing' || pursuit.state === 'grappled');
  const sea = voyage.sea;
  const here = sea ? seaHexAt(sea, sea.ship.q, sea.ship.r) : undefined;
  const docked = inPort(voyage);

  function day() {
    if (!monsters || !voyage) return;
    const report = sailDay(voyage, monsters);
    setVoyage(report.voyage);
    setStrike(null);
    setNote(report.stormDamage > 0 ? t('solo.voyage.stormDamage', { damage: report.stormDamage }) : '');
  }

  function sail(hex: SeaHex) {
    if (!voyage || !sea || !canSailTo(sea, hex.q, hex.r) || voyage.moves <= 0) return;
    const report = sailTo(voyage, hex.q, hex.r);
    setVoyage(report.voyage);
    setStrike(null);
    const key = report.event === 'reef' ? 'reef' : report.event === 'arrived' ? 'arrivedPort' : report.event === 'port' || report.event === 'home' ? 'harbour' : '';
    setNote(key ? t(`solo.voyage.sailed.${key}`, { damage: report.reefDamage }) : '');
  }

  function search() {
    if (!voyage || !monsters) return;
    const report = exploreIsland(voyage, monsters);
    if (!report) return;
    setVoyage(report.voyage);
    if (report.outcome === 'wreck' && activeId) updateCharacter((c) => ({ ...c, currency: { ...c.currency, cash: c.currency.cash + report.gold } }));
    setNote(t(`solo.voyage.island.${report.outcome}`, { gold: report.gold }));
  }

  function putOnTable() {
    if (monster && voyage?.encounter) spawn(monster, voyage.encounter.count);
  }

  function spawn(monster: NonNullable<typeof crew>, count: number) {
    setEncounter((current) => {
      const labels = current.monsters.map((entry) => entry.label);
      const added = [] as ReturnType<typeof spawnMonster>[];
      for (let i = 0; i < count; i += 1) added.push(spawnMonster(monster, [...labels, ...added.map((entry) => entry.label)], crypto.randomUUID()));
      return { ...current, monsters: [...current.monsters, ...added] };
    });
  }

  /** The sea monster strikes at the ship: its first section with an attack, against the ship's Evasion. */
  function strikeShip() {
    if (!voyage || !monster) return;
    const section = monster.sections.find((entry) => entry.accuracy && isValuePair(entry.accuracy));
    if (!section) return;
    const result = attackShip(voyage, section, fixed, Math.random, aimed);
    if (!result) return;
    setStrike(result);
    setVoyage(result.voyage);
  }

  /** The hostile ship fires back at one of ours, chosen at random. */
  function returnFire(base: Voyage): { voyage: Voyage; line: string } {
    if (!base.pursuit || base.pursuit.state !== 'closing') return { voyage: base, line: '' };
    const index = Math.floor(Math.random() * fleetOf(base).length);
    const shot = theirVolley(base.pursuit, fleetOf(base)[index].ship);
    const hit = shot.hit ? loseCrew(hullBlow(base, shot.damage, index), 1) : base;
    return { voyage: hit, line: t('solo.voyage.theirVolley', { value: shot.value, target: shot.target, outcome: shot.hit ? t('solo.voyage.volleyHit', { damage: shot.damage }) : t('solo.voyage.volleyMiss') }) };
  }

  function broadside() {
    if (!voyage?.pursuit || !hunted) return;
    const ours = ourVolley(voyage.pursuit, voyage.ship, level + crewModifier(voyage));
    let next: Voyage = { ...voyage, pursuit: ours.pursuit };
    const lines = [t('solo.voyage.ourVolley', { value: ours.exchange.value, target: ours.exchange.target, outcome: ours.exchange.hit ? t('solo.voyage.volleyHit', { damage: ours.exchange.damage }) : t('solo.voyage.volleyMiss') })];
    if (ours.pursuit.state === 'sunk') lines.push(t('solo.voyage.theirSunk'));
    else {
      const back = returnFire(next);
      next = back.voyage;
      lines.push(back.line);
    }
    setVoyage(next);
    setFightLog(lines);
  }

  function grappleHooks() {
    if (!voyage?.pursuit || voyage.pursuit.state !== 'closing') return;
    const result = grapple(voyage.pursuit, level + crewModifier(voyage), voyage.weather);
    let next: Voyage = { ...voyage, pursuit: result.pursuit };
    const lines = [t('solo.voyage.grappleRoll', { value: result.contest.value, target: result.contest.target, outcome: t(result.contest.success ? 'solo.voyage.grappled' : 'solo.voyage.grappleFail') })];
    if (result.contest.success && crew) spawn(crew, voyage.pursuit.crewCount);
    else {
      const back = returnFire(next);
      next = back.voyage;
      lines.push(back.line);
    }
    setVoyage(next);
    setFightLog(lines);
  }

  function runAway() {
    if (!voyage?.pursuit || voyage.pursuit.state !== 'closing') return;
    const result = breakAway(voyage.pursuit, voyage.moves);
    let next: Voyage = { ...voyage, pursuit: result.pursuit };
    const lines = [t('solo.voyage.breakRoll', { value: result.contest.value, target: result.contest.target, outcome: t(result.contest.success ? 'solo.voyage.brokeAway' : 'solo.voyage.breakFail') })];
    if (!result.contest.success) {
      const back = returnFire(next);
      next = back.voyage;
      lines.push(back.line);
    }
    setVoyage(next);
    setFightLog(lines);
  }

  /** The deck is ours: the strongbox, the crates, and the ship if it floats. */
  function claimShip() {
    if (!voyage?.pursuit || voyage.pursuit.state !== 'grappled') return;
    const prize = takePrize(voyage.pursuit, level);
    setVoyage(claimPrize(voyage, prize));
    pay(prize.gold);
    setFightLog([t('solo.voyage.prize', { gold: prize.gold, crates: prize.goods.reduce((sum, units) => sum + units, 0), ship: prize.ship ? t(`solo.voyage.ships.${prize.ship.ship}`, { hull: prize.ship.hull }) : '—' })]);
  }

  /** Signs sailors on at the quay: a fee each, up to what the fleet needs. */
  function hire(count: number) {
    if (!voyage) return;
    const room = crewNeeded(voyage) - crewAboard(voyage);
    const hired = Math.min(count, room);
    if (hired <= 0 || cash < hired * HIRE_FEE) return;
    const next = hireCrew(voyage, hired);
    if (!next) return;
    pay(-hired * HIRE_FEE);
    setVoyage(next);
  }

  /** Steps ashore in the new land: a fresh land map centred on the harbour town, the sea chart put away. */
  function landHere() {
    if (!voyage?.arrived || !monsters) return;
    const kind = SETTLEMENT_KINDS.find((entry) => entry === here?.settlement) ?? ('town' satisfies SettlementKind);
    setHexMap(landfall({ level, monsters }, kind));
    setVoyage(null);
    setLanding(false);
  }

  function buyShip() {
    if (!voyage || cash < SHIP_PRICE[shipToBuy]) return;
    const next = addShip(voyage, shipToBuy);
    if (!next) return;
    pay(-SHIP_PRICE[shipToBuy]);
    setVoyage(next);
  }

  function trade(good: number, units: number, price: number) {
    if (!voyage) return;
    if (units > 0) {
      if (cash < price * units) return;
      const next = loadGoods(voyage, good, units);
      if (!next) return;
      pay(-price * units);
      setVoyage(next);
    } else {
      const next = unloadGoods(voyage, good, -units);
      if (!next) return;
      pay(price * -units);
      setVoyage(next);
    }
  }

  /** Down the gangway into the streets of the town the harbour belongs to. */
  function goAshore() {
    if (!sea || !harbour) return;
    setDungeon(generateSettlement(harbour.settlement ?? 'town', level, `port:${harbour.q},${harbour.r}`));
    setNote(t('solo.voyage.ashore'));
  }

  function logVoyage() {
    if (!voyage) return;
    const title = t(voyage.arrived ? 'solo.voyage.logArrived' : 'solo.voyage.logWrecked');
    setCampaign((current) => addEntry(current, { kind: 'scene', title, text: t('solo.voyage.logText', { days: voyage.day, hull: voyage.hull }), scene: 0 }, crypto.randomUUID()));
    setLogged(true);
  }

  const xs = sea ? sea.hexes.map((hex) => center(hex).x) : [];
  const ys = sea ? sea.hexes.map((hex) => center(hex).y) : [];
  const box = sea ? { x: Math.min(...xs) - SIZE, y: Math.min(...ys) - SIZE, w: Math.max(...xs) - Math.min(...xs) + 2 * SIZE, h: Math.max(...ys) - Math.min(...ys) + 2 * SIZE } : null;

  const describe = (hex: SeaHex) => {
    if (!hex.seen) return t('solo.voyage.unknownWater');
    if (hex.kind === 'port') return `${t('solo.voyage.kinds.port')}${hex.visited && hex.name ? `: ${t(`solo.voyage.ports.${hex.name}`)}` : ''}`;
    if (hex.kind === 'island') return `${t('solo.voyage.kinds.island')}${hex.visited && hex.name ? `: ${t(`solo.voyage.islands.${hex.name}`)}` : ''}`;
    return t(`solo.voyage.kinds.${hex.visited ? hex.kind : 'water'}`);
  };

  return (
    <section className={styles.panel} aria-labelledby="solo-voyage">
      <div className={styles.panelHead}>
        <h3 id="solo-voyage">{t('solo.voyage.title')}</h3>
        <p className={styles.note}>
          {t(`solo.voyage.ships.${voyage.ship}`, { hull: HULL[voyage.ship] })} ·{' '}
          {t('solo.voyage.status', {
            day: voyage.day,
            left: sea ? hexDistance(sea.ship, sea.destination) : voyage.distance - voyage.progress,
            hull: voyage.hull,
            hullMax: HULL[voyage.ship],
            supplies: voyage.supplies,
          })}
        </p>
      </div>
      <p className={styles.note}>
        {t('solo.voyage.fleet')}:{' '}
        {fleet.map((entry, index) => `${index === 0 ? '★ ' : ''}${t(`solo.voyage.shipNames.${entry.ship}`)} ${entry.hull}/${HULL[entry.ship]}`).join(' · ')}
        {fleet.length > 1 && (
          <label>
            {' '}
            {t('solo.voyage.aim')}{' '}
            <select value={aimed} onChange={(event) => setTarget(Number(event.target.value))}>
              {fleet.map((entry, index) => (
                <option key={index} value={index}>
                  {index + 1}. {t(`solo.voyage.shipNames.${entry.ship}`)}
                </option>
              ))}
            </select>
          </label>
        )}
      </p>
      {voyage.weather && <p>{t(`solo.voyage.weathers.${voyage.weather}`)}</p>}
      {sea && !over && (
        <p className={styles.note}>{t('solo.voyage.moves', { moves: voyage.moves })}</p>
      )}
      {note && (
        <p role="status" className={styles.note}>
          {note}
        </p>
      )}
      {voyage.supplies === 0 && !over && <p role="alert">{t('solo.voyage.hungry', { penalty: voyage.hunger })}</p>}
      {voyage.hunger >= HUNGER_MAX && !over && <p role="alert">{t('solo.voyage.starving')}</p>}

      {box && sea && (
        <svg className={styles.hexSvg} viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} role="group" aria-label={t('solo.voyage.chartAria')}>
          {sea.hexes.map((hex) => {
            const { x, y } = center(hex);
            const ownShip = hex.q === sea.ship.q && hex.r === sea.ship.r;
            const reachable = !over && voyage.moves > 0 && canSailTo(sea, hex.q, hex.r);
            const known = hex.seen && (hex.visited || hex.kind === 'port' || hex.kind === 'water' || hex.kind === 'island' || hex.kind === 'reef');
            return (
              <g
                key={`${hex.q},${hex.r}`}
                role="button"
                tabIndex={reachable ? 0 : -1}
                aria-label={`${describe(hex)}${ownShip ? ` — ${t('solo.voyage.shipHere')}` : ''}`}
                aria-disabled={!reachable}
                className={styles.hexCell}
                data-biome={hex.seen ? (hex.visited || hex.kind === 'port' ? hex.kind : 'sea') : 'unknown'}
                data-reachable={reachable || undefined}
                onClick={() => sail(hex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sail(hex);
                  }
                }}
              >
                <polygon points={corners(x, y)} />
                <text x={x} y={y + 6} textAnchor="middle" aria-hidden="true">
                  {ownShip ? '⛵' : known && (hex.visited || hex.kind === 'port') ? GLYPH[hex.kind] : hex.seen ? '' : '?'}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {pursuit && (
        <div className={styles.report}>
          <p>
            <strong>{t(`solo.voyage.pursuitStates.${pursuit.state}`)}</strong>{' '}
            {t('solo.voyage.pursuer', { ship: t(`solo.voyage.shipNames.${pursuit.ship}`), hull: pursuit.hull, max: HULL[pursuit.ship], count: pursuit.crewCount, crew: crew?.name ?? '?', round: pursuit.round })}
          </p>
          {fightLog.map((line, index) => (
            <p key={index} role="status">
              {line}
            </p>
          ))}
          <div className={styles.controls}>
            {pursuit.state === 'closing' && !over && (
              <>
                <button type="button" onClick={broadside}>
                  {t('solo.voyage.broadside')}
                </button>
                <button type="button" onClick={grappleHooks}>
                  {t('solo.voyage.grapple')}
                </button>
                <button type="button" onClick={runAway}>
                  {t('solo.voyage.breakAway')}
                </button>
              </>
            )}
            {pursuit.state === 'grappled' && !over && (
              <button type="button" onClick={claimShip}>
                {t('solo.voyage.claim')}
              </button>
            )}
          </div>
        </div>
      )}
      <p className={styles.note} role="status">
        {t('solo.voyage.crewLine', { crew: crewAboard(voyage), needed: crewNeeded(voyage) })}
        {undermanned(voyage) && ` ${t('solo.voyage.shortHanded')}`}
      </p>
      {docked && !over && harbour && (
        <div className={styles.report}>
          <p>
            <strong>{t('solo.voyage.harbour', { name: harbour.name ? t(`solo.voyage.ports.${harbour.name}`) : '' })}</strong>{' '}
            {t('solo.voyage.townAshore', { town: t(`solo.hex.settlements.${harbour.settlement ?? 'town'}`) })}{' '}
            <button type="button" onClick={goAshore}>
              {t('solo.voyage.goAshore')}
            </button>
          </p>
          <p className={styles.note}>{t('solo.voyage.holds', { load: cargoLoad(voyage), capacity: cargoCapacity(voyage), cash })}</p>
          {undermanned(voyage) && (
            <p>
              <button type="button" onClick={() => hire(1)} disabled={cash < HIRE_FEE}>
                {t('solo.voyage.hireOne', { fee: HIRE_FEE })}
              </button>{' '}
              <button type="button" onClick={() => hire(crewNeeded(voyage) - crewAboard(voyage))} disabled={cash < (crewNeeded(voyage) - crewAboard(voyage)) * HIRE_FEE}>
                {t('solo.voyage.hireAll', { count: crewNeeded(voyage) - crewAboard(voyage), fee: (crewNeeded(voyage) - crewAboard(voyage)) * HIRE_FEE })}
              </button>
            </p>
          )}
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>{t('solo.voyage.good')}</th>
                  <th>{t('solo.voyage.price')}</th>
                  <th>{t('solo.voyage.held')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {GOODS.map((good, index) => {
                  const price = goodPrice(good, harbour.market?.[index] ?? 3);
                  return (
                    <tr key={good}>
                      <td>{t(`solo.voyage.goods.${good}`)}</td>
                      <td>{price} G</td>
                      <td>{voyage.cargo[index] ?? 0}</td>
                      <td>
                        <button type="button" onClick={() => trade(index, 1, price)} disabled={cash < price || cargoLoad(voyage) >= cargoCapacity(voyage)} aria-label={t('solo.voyage.buyAria', { good: t(`solo.voyage.goods.${good}`) })}>
                          {t('solo.voyage.buy')}
                        </button>
                        <button type="button" onClick={() => trade(index, -1, price)} disabled={(voyage.cargo[index] ?? 0) === 0} aria-label={t('solo.voyage.sellAria', { good: t(`solo.voyage.goods.${good}`) })}>
                          {t('solo.voyage.sell')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {fleet.length < FLEET_MAX && (
            <p>
              <label>
                {t('solo.voyage.shipyard')}{' '}
                <select value={shipToBuy} onChange={(event) => setShipToBuy(event.target.value as Ship)}>
                  {SHIPS.map((entry) => (
                    <option key={entry} value={entry}>
                      {t(`solo.voyage.shipNames.${entry}`)} — {SHIP_PRICE[entry]} G
                    </option>
                  ))}
                </select>
              </label>{' '}
              <button type="button" onClick={buyShip} disabled={cash < SHIP_PRICE[shipToBuy]}>
                {t('solo.voyage.buyShip')}
              </button>
            </p>
          )}
        </div>
      )}
      {voyage.encounter && monster && (
        <p>
          {t('solo.voyage.encounter', { count: voyage.encounter.count, name: monster.name, level: monster.level })}{' '}
          <button type="button" onClick={putOnTable}>
            {t('solo.hex.putOnTable')}
          </button>
          <button type="button" onClick={strikeShip} disabled={over}>
            {t('solo.voyage.strikeShip')}
          </button>
          <label>
            <input type="checkbox" checked={fixed} onChange={(event) => setFixed(event.target.checked)} /> {t('solo.fixed')}
          </label>
        </p>
      )}
      {strike && (
        <p role="status">
          {t('solo.voyage.strikeResult', {
            attack: strike.attack.successValue,
            evasion: strike.evasion.value,
            outcome: strike.hit ? t('solo.voyage.strikeHit', { lost: strike.hullLost }) : t('solo.voyage.strikeMiss'),
          })}
        </p>
      )}
      {over && <p role="status">{t(voyage.arrived ? 'solo.voyage.arrived' : 'solo.voyage.wrecked')}</p>}

      <div className={styles.controls}>
        {!over && (
          <>
            <button type="button" onClick={day} disabled={!monsters || hunted}>
              {t('solo.voyage.nextDay')}
            </button>
            {docked && (
              <button type="button" onClick={() => setVoyage(dayInPort(voyage))}>
                {t('solo.voyage.dayInPort')}
              </button>
            )}
            {here?.kind === 'island' && !here.explored && (
              <button type="button" onClick={search} disabled={!monsters}>
                {t('solo.voyage.searchIsland')}
              </button>
            )}
            <button type="button" onClick={() => setVoyage(repairDay(voyage))} disabled={voyage.hull >= HULL[voyage.ship]}>
              {t('solo.voyage.repair')}
            </button>
            <label>
              {t('solo.voyage.blow')}{' '}
              <input type="number" min={1} value={blow} onChange={(event) => setBlow(event.target.value)} style={{ width: '4em' }} />
            </label>
            <button type="button" onClick={() => setVoyage(hullBlow(voyage, Math.floor(Number(blow)) || 0, aimed))}>
              {t('solo.voyage.hit')}
            </button>
          </>
        )}
        {voyage.arrived && !landing && (
          <button type="button" onClick={() => setLanding(true)} disabled={!monsters}>
            {t('solo.voyage.landfall')}
          </button>
        )}
        {voyage.arrived && landing && (
          <>
            <span className={styles.note}>{t('solo.voyage.landfallWarn')}</span>
            <button type="button" onClick={landHere}>
              {t('solo.voyage.landfallConfirm')}
            </button>
            <button type="button" onClick={() => setLanding(false)}>
              {t('solo.voyage.landfallCancel')}
            </button>
          </>
        )}
        {over && (
          <button type="button" onClick={logVoyage} disabled={logged}>
            {t('solo.hex.festivalLog')}
          </button>
        )}
        <button type="button" onClick={() => setVoyage(null)}>
          {t(over ? 'solo.voyage.end' : 'solo.voyage.abandon')}
        </button>
      </div>
    </section>
  );
}
