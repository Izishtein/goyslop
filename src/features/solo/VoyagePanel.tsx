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
import { driftMarkets, hexAt, isPort, PENALTY_FIELDS, withMarket } from '../../lib/hexmap';
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
  goAboard,
  goAshore,
  harbourHere,
  hireable,
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
  setSail,
  shipHex,
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
import { GameIcon } from '../../components/icons';
import styles from './SoloView.module.css';
import { useMonsters } from './useMonsters';

/** Ids of the status effects/** Ids of the status effects the voyage lays on the open character. */
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
  const [hexMap, setHexMap] = useAtom(hexMapAtom);
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
  const over = !!voyage && voyage.wrecked;
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
  const hunger = voyage && !over && voyage.aboard ? voyage.hunger : 0;
  const stormy = !!voyage && !over && voyage.aboard && voyage.weather === 'storm';
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

  const partyHex = hexAt(hexMap, hexMap.party.q, hexMap.party.r);
  const partyInPort = isPort(hexMap, partyHex);

  /** Puts out from the harbour the party stands in, in the ship chosen. */
  function setSailHere() {
    if (!partyHex || !partyInPort) return;
    setVoyage(setSail(ship, level, { q: partyHex.q, r: partyHex.r, settlement: partyHex.feature.settlement }));
    setHexMap((current) => withMarket(current, partyHex.q, partyHex.r));
    setLogged(false);
    setNote('');
    setStrike(null);
  }

  if (!voyage) {
    return (
      <section className={styles.panel} aria-labelledby="solo-voyage">
        <div className={styles.panelHead}>
          <h3 id="solo-voyage"><GameIcon name="solo.voyage" />{t('solo.voyage.title')}</h3>
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
          <button type="button" onClick={setSailHere} disabled={!partyInPort}>
            {t('solo.voyage.setSail')}
          </button>
          <span className={styles.numeric}>{t('solo.dungeon.forLevel', { level })}</span>
        </div>
        {!partyInPort && <p className={styles.note}>{t('solo.voyage.needHarbour')}</p>}
      </section>
    );
  }

  const monster = voyage.encounter ? byId.get(voyage.encounter.monsterId) : undefined;
  const pursuit = voyage.pursuit;
  const crew = pursuit ? byId.get(pursuit.crewId) : undefined;
  const fleet = fleetOf(voyage);
  const aimed = Math.min(target, fleet.length - 1);
  const harbour = harbourHere(voyage, hexMap);
  const hunted = !!pursuit && (pursuit.state === 'closing' || pursuit.state === 'grappled');
  const here = shipHex(voyage, hexMap);
  const docked = inPort(voyage, hexMap);
  /** The harbour's market, quay and shipyard are open to a party aboard or ashore beside its ship. */
  const atQuay = docked && (voyage.aboard || (hexMap.party.q === voyage.at.q && hexMap.party.r === voyage.at.r));

  function day() {
    if (!monsters || !voyage) return;
    if (!voyage.aboard) return;
    const report = sailDay(voyage, monsters);
    setVoyage(report.voyage);
    setHexMap((current) => driftMarkets(current));
    setStrike(null);
    setNote(report.stormDamage > 0 ? t('solo.voyage.stormDamage', { damage: report.stormDamage }) : '');
  }

  function search() {
    if (!voyage || !monsters) return;
    const report = exploreIsland(voyage, hexMap, monsters);
    if (!report) return;
    setVoyage(report.voyage);
    setHexMap(report.map);
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
    const hired = Math.min(count, hireable(voyage));
    if (hired <= 0 || cash < hired * HIRE_FEE) return;
    const next = hireCrew(voyage, hexMap, hired);
    if (!next) return;
    pay(-hired * HIRE_FEE);
    setVoyage(next);
  }

  /** Down the gangway at the quay: the party is in the harbour town, the ship waits alongside. */
  function disembark() {
    if (!voyage) return;
    const next = goAshore(voyage, hexMap);
    if (next) setVoyage(next);
  }

  /** Back aboard the ship the party stands beside. */
  function embark() {
    if (!voyage) return;
    const next = goAboard(voyage, hexMap);
    if (next) setVoyage(next);
  }

  function buyShip() {
    if (!voyage || cash < SHIP_PRICE[shipToBuy]) return;
    const next = addShip(voyage, hexMap, shipToBuy);
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

  /** Into the streets of the town the harbour belongs to. */
  function visitTown() {
    if (!harbour) return;
    setDungeon(generateSettlement(harbour.feature.settlement ?? 'town', level, `port:${harbour.q},${harbour.r}`));    setNote(t('solo.voyage.ashore'));
  }

  function logVoyage() {
    if (!voyage) return;
    const title = t('solo.voyage.logWrecked');
    setCampaign((current) => addEntry(current, { kind: 'scene', title, text: t('solo.voyage.logText', { days: voyage.day, hull: voyage.hull }), scene: 0 }, crypto.randomUUID()));
    setLogged(true);
  }

  return (
    <section className={styles.panel} aria-labelledby="solo-voyage">
      <div className={styles.panelHead}>
        <h3 id="solo-voyage"><GameIcon name="solo.voyage" />{t('solo.voyage.title')}</h3>
        <p className={styles.note}>
          {t(`solo.voyage.ships.${voyage.ship}`, { hull: HULL[voyage.ship] })} ·{' '}
          {t('solo.voyage.status', {
            day: voyage.day,
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
      {!over && voyage.aboard && <p className={styles.note}>{t('solo.voyage.moves', { moves: voyage.moves })}</p>}
      {!over && !voyage.aboard && (
        <p className={styles.note}>
          {t('solo.voyage.waiting', { q: voyage.at.q, r: voyage.at.r })}{' '}
          {hexMap.party.q === voyage.at.q && hexMap.party.r === voyage.at.r && (
            <button type="button" onClick={embark}>
              {t('solo.voyage.goAboard')}
            </button>
          )}
        </p>
      )}
      {note && (
        <p role="status" className={styles.note}>
          {note}
        </p>
      )}
      {voyage.supplies === 0 && !over && <p role="alert">{t('solo.voyage.hungry', { penalty: voyage.hunger })}</p>}
      {voyage.hunger >= HUNGER_MAX && !over && <p role="alert">{t('solo.voyage.starving')}</p>}

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
      {atQuay && !over && harbour && (
        <div className={styles.report}>
          <p>
            <strong>{t('solo.voyage.harbour', { name: harbour.place?.trim() ?? '' })}</strong>{' '}
            {t('solo.voyage.townAshore', { town: t(`solo.hex.settlements.${harbour.feature.settlement ?? 'town'}`) })}{' '}
            <button type="button" onClick={visitTown}>
              {t('solo.voyage.visitTown')}
            </button>{' '}
            {voyage.aboard && (
              <button type="button" onClick={disembark}>
                {t('solo.voyage.goAshore')}
              </button>
            )}
          </p>
          <p className={styles.note}>{t('solo.voyage.holds', { load: cargoLoad(voyage), capacity: cargoCapacity(voyage), cash })}</p>
          {undermanned(voyage) && (
            <p>
              <span className={styles.note}>{voyage.recruits === null ? '' : t('solo.voyage.quayCrew', { count: voyage.recruits })} </span>
              {hireable(voyage) === 0 ? (
                <span className={styles.note}>{t('solo.voyage.quayEmpty')}</span>
              ) : (
                <>
                  <button type="button" onClick={() => hire(1)} disabled={cash < HIRE_FEE}>
                    {t('solo.voyage.hireOne', { fee: HIRE_FEE })}
                  </button>{' '}
                  <button type="button" onClick={() => hire(hireable(voyage))} disabled={cash < hireable(voyage) * HIRE_FEE}>
                    {t('solo.voyage.hireAll', { count: hireable(voyage), fee: hireable(voyage) * HIRE_FEE })}
                  </button>
                </>
              )}
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
      {over && <p role="status">{t('solo.voyage.wrecked')}</p>}

      <div className={styles.controls}>
        {!over && voyage.aboard && (
          <>
            <button type="button" onClick={day} disabled={!monsters || hunted}>
              {t('solo.voyage.nextDay')}
            </button>
            {docked && (
              <button
                type="button"
                onClick={() => {
                  setVoyage(dayInPort(voyage, harbour?.feature.settlement));
                  setHexMap((current) => driftMarkets(current));
                }}
              >
                {t('solo.voyage.dayInPort')}
              </button>
            )}
            {here?.feature.kind === 'island' && !here.explored && (
              <button type="button" onClick={search} disabled={!monsters}>
                {t('solo.voyage.searchIsland')}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setVoyage(repairDay(voyage));
                setHexMap((current) => driftMarkets(current));
              }}
              disabled={voyage.hull >= HULL[voyage.ship]}
            >
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
