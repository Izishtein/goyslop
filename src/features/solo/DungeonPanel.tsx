import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Monster } from '../../data/monsters';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { classLevel } from '../../lib/spellcasting';
import { spawnMonster } from '../../lib/encounter';
import {
  ascend,
  canEnter,
  currentRoom,
  descend,
  enterRoom,
  generateDungeon,
  rollDisableDevice,
  type DisableDeviceRoll,
  updateRoom,
  type Room,
} from '../../lib/dungeon';
import { BIOMES, type Biome } from '../../lib/hexmap';
import { activeCharacterIdAtom, charactersAtom, useUpdateCharacter } from '../../state/characters';
import { dungeonAtom } from '../../state/dungeon';
import { encounterAtom } from '../../state/encounter';
import styles from './SoloView.module.css';
import { useMonsters } from './useMonsters';

const CELL = 52;
const GLYPH: Record<string, string> = { entrance: '⌂', empty: '·', monsters: '☠', trap: '⚠', treasure: '$', special: '✦', hazard: '≈', secret: '?!', stairs: '≣', boss: '♛', market: '¤', tavern: '♨', temple: '†', guild: '⚒', slum: '▒', keep: '♜' };

export function DungeonPanel() {
  const { t } = useTranslation();
  const [dungeon, setDungeon] = useAtom(dungeonAtom);
  const setEncounter = useSetAtom(encounterAtom);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const updateCharacter = useUpdateCharacter(activeId ?? '');
  const { monsters, byId } = useMonsters();
  const [biome, setBiome] = useState<Biome>('hills');
  const [tools, setTools] = useState(true);
  const [device, setDevice] = useState<{ kind: 'trap' | 'lock' | 'search'; roll: DisableDeviceRoll } | null>(null);

  const character = characters.find((entry) => entry.id === activeId);
  const level = character ? Math.max(1, adventurerLevel(character.classes)) : 1;

  function generate() {
    if (!monsters) return;
    setDungeon(generateDungeon({ level, monsters, biome, place: 'free' }));
  }

  function putOnTable(monster: Monster, count: number) {
    setEncounter((current) => {
      const labels = current.monsters.map((entry) => entry.label);
      const added = [] as ReturnType<typeof spawnMonster>[];
      for (let i = 0; i < count; i += 1) added.push(spawnMonster(monster, [...labels, ...added.map((entry) => entry.label)], crypto.randomUUID()));
      return { ...current, monsters: [...current.monsters, ...added] };
    });
  }

  if (!dungeon) {
    return (
      <section className={styles.panel} aria-labelledby="solo-dungeon">
        <div className={styles.panelHead}>
          <h3 id="solo-dungeon">{t('solo.dungeon.title')}</h3>
          <p className={styles.note}>{t('solo.dungeon.note')}</p>
        </div>
        <div className={styles.toolbar}>
          <label>
            {t('solo.dungeon.biome')}
            <select value={biome} onChange={(e) => setBiome(e.target.value as Biome)}>
              {BIOMES.map((entry) => (
                <option key={entry} value={entry}>
                  {t(`solo.hex.biomes.${entry}`)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={generate} disabled={!monsters}>
            {t('solo.dungeon.generate')}
          </button>
          <span className={styles.numeric}>{t('solo.dungeon.forLevel', { level })}</span>
        </div>
      </section>
    );
  }

  const levelRooms = dungeon.levels[dungeon.at.level].rooms;
  const here = currentRoom(dungeon);
  const shown = levelRooms.filter((room) => room.seen);
  const xs = levelRooms.map((room) => room.x);
  const ys = levelRooms.map((room) => room.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = (Math.max(...xs) - minX + 1) * CELL;
  const height = (Math.max(...ys) - minY + 1) * CELL;
  const pos = (room: Room) => ({ x: (room.x - minX) * CELL + CELL / 2, y: (room.y - minY) * CELL + CELL / 2 });

  function go(room: Room) {
    if (!dungeon || !canEnter(dungeon, room.id)) return;
    const next = enterRoom(dungeon, room.id);
    if (next) setDungeon(next);
  }

  function patch(change: Partial<Room>) {
    if (!dungeon) return;
    setDungeon(updateRoom(dungeon, dungeon.at.level, here.id, change));
  }

  function takeGold() {
    if (!here.gold) return;
    const gold = here.gold;
    if (activeId) updateCharacter((c) => ({ ...c, currency: { ...c.currency, cash: c.currency.cash + gold } }));
    patch({ gold: 0 });
  }

  /** Disable Device: Scout or Ranger Level + DEX modifier, and -4 without Scout's Tools or any level in either class (CR I p. 102). */
  function disable(kind: 'trap' | 'lock') {
    const target = kind === 'trap' ? here.trapTn : here.lockTn;
    if (target === undefined) return;
    const skill = character ? Math.max(classLevel(character, 'scout'), classLevel(character, 'ranger')) : 0;
    const standard = skill + (character ? abilityModifier(abilityTotal(character.abilities.DEX)) : 0);
    const roll = rollDisableDevice(skill > 0 ? standard : 0, tools && skill > 0, target);
    setDevice({ kind, roll });
    if (roll.success) patch(kind === 'trap' ? { disarmed: true } : { unlocked: true });
    else if (kind === 'trap') patch({ sprung: true });
  }

  /** Search / Spot Traps: Scout or Ranger Level + INT modifier against the trap's Target Number (CR I pp. 103, 106); no tools needed. */
  function search() {
    if (here.trapTn === undefined) return;
    const skill = character ? Math.max(classLevel(character, 'scout'), classLevel(character, 'ranger')) : 0;
    const standard = skill + (character ? abilityModifier(abilityTotal(character.abilities.INT)) : 0);
    const roll = rollDisableDevice(skill > 0 ? standard : 0, true, here.trapTn);
    setDevice({ kind: 'search', roll });
    if (roll.success) patch({ trapFound: true });
  }

  const locked = here.lockTn !== undefined && !here.unlocked;
  const monster = here.monsterId ? byId.get(here.monsterId) : undefined;
  const label = (room: Room) => `${t(`solo.dungeon.kinds.${room.visited ? room.kind : 'unknown'}`)}${room === here ? ` — ${t('solo.dungeon.youAreHere')}` : ''}`;

  return (
    <section className={styles.panel} aria-labelledby="solo-dungeon">
      <div className={styles.panelHead}>
        <h3 id="solo-dungeon">{t('solo.dungeon.title')}</h3>
        <p className={styles.note}>
          {dungeon.kind === 'settlement' ? t(`solo.hex.settlements.${dungeon.settlement}`) : dungeon.kind === 'lair' ? t(`solo.dungeon.lairThemes.${dungeon.theme}`) : t(`solo.dungeon.themes.${dungeon.theme}`)} · {t('solo.dungeon.depth', { level: dungeon.at.level + 1, total: dungeon.levels.length })} · {t('solo.dungeon.forLevel', { level: dungeon.level })}
        </p>
      </div>

      {dungeon.groups.length > 1 && (
        <p className={styles.note}>
          {t('solo.dungeon.inhabitants')}: {dungeon.groups.map((group, index) => `${byId.get(group.monsterId)?.name ?? group.monsterId}${index === 0 ? ` (${t('solo.dungeon.guardianFolk')})` : ''}`).join(', ')}.{' '}
          {dungeon.groupRelations
            .map((entry) => t('solo.dungeon.groupRelation', { a: byId.get(dungeon.groups[entry.a].monsterId)?.name ?? '', b: byId.get(dungeon.groups[entry.b].monsterId)?.name ?? '', relation: t(`solo.hex.relations.${entry.relation}`) }))
            .join('; ')}
        </p>
      )}
      <svg className={styles.hexSvg} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={t('solo.dungeon.mapAria')}>
        {levelRooms.flatMap((room) =>
          room.links
            .filter((id) => id > room.id && (room.seen || levelRooms[id].seen) && (room.visited || levelRooms[id].visited))
            .map((id) => {
              const a = pos(room);
              const b = pos(levelRooms[id]);
              return <line key={`${room.id}-${id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.dungeonDoor} />;
            }),
        )}
        {shown.map((room) => {
          const { x, y } = pos(room);
          const reachable = canEnter(dungeon, room.id);
          return (
            <g
              key={room.id}
              role="button"
              tabIndex={reachable ? 0 : -1}
              aria-label={label(room)}
              aria-disabled={!reachable}
              className={styles.dungeonRoom}
              data-visited={room.visited || undefined}
              data-reachable={reachable || undefined}
              data-here={room === here || undefined}
              onClick={() => go(room)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  go(room);
                }
              }}
            >
              <rect x={x - 17} y={y - 17} width={34} height={34} rx={4} />
              <text x={x} y={y + 6} textAnchor="middle" aria-hidden="true">
                {room.visited ? GLYPH[room.kind] : '?'}
              </text>
            </g>
          );
        })}
      </svg>

      <div className={styles.report}>
        <p>
          <strong>{t(`solo.dungeon.kinds.${here.kind}`)}</strong>
          {here.cleared && ` — ${t('solo.dungeon.cleared')}`}
        </p>
        {here.trap !== undefined && (here.trapFound || here.sprung || here.disarmed) && <p>{t(`solo.dungeon.traps.${here.trap}`)}</p>}
        {here.trapTn !== undefined && !here.trapFound && !here.sprung && !here.disarmed && (
          <p>
            {t('solo.dungeon.trapHidden')}{' '}
            <button type="button" onClick={search}>
              {t('solo.dungeon.search')}
            </button>
            <button type="button" onClick={() => patch({ trapFound: true, sprung: true })}>
              {t('solo.dungeon.rushOn')}
            </button>
          </p>
        )}
        {here.trapTn !== undefined && (here.trapFound || here.sprung || here.disarmed) && (
          <p>
            {here.disarmed ? t('solo.dungeon.disarmed') : here.sprung ? t('solo.dungeon.sprung') : t('solo.dungeon.trapTarget', { tn: here.trapTn })}{' '}
            {!here.disarmed && !here.sprung && (
              <button type="button" onClick={() => disable('trap')}>
                {t('solo.dungeon.disarm')}
              </button>
            )}
          </p>
        )}
        {here.hazard !== undefined && <p>{t(`solo.dungeon.hazards.${here.hazard}`)}</p>}
        {here.special !== undefined && <p>{t(dungeon.kind === 'settlement' ? `solo.dungeon.townEvents.${here.special}` : `solo.dungeon.specials.${here.special}`)}</p>}
        {monster && here.count && (
          <p>
            {t('solo.dungeon.monsters', { count: here.count, name: monster.name, level: monster.level })}{' '}
            <button type="button" onClick={() => putOnTable(monster, here.count ?? 1)}>
              {t('solo.hex.putOnTable')}
            </button>
            <button type="button" onClick={() => patch({ cleared: !here.cleared })}>
              {here.cleared ? t('solo.dungeon.reopen') : t('solo.dungeon.markCleared')}
            </button>
          </p>
        )}
        {here.gold !== undefined && (
          <p>
            {here.gold > 0 ? t('solo.dungeon.hoard', { gold: here.gold }) : t('solo.dungeon.hoardTaken')}
            {locked && ` ${t('solo.dungeon.locked', { tn: here.lockTn })}`}{' '}
            {locked && (
              <button type="button" onClick={() => disable('lock')}>
                {t('solo.dungeon.pickLock')}
              </button>
            )}
            {here.item && here.gold > 0 && ` ${t('solo.dungeon.hoardItem')}`}{' '}
            {here.gold > 0 && (
              <button type="button" onClick={takeGold} disabled={!activeId || locked}>
                {t('solo.dungeon.takeGold', { gold: here.gold })}
              </button>
            )}
          </p>
        )}
        {(here.trapTn !== undefined || here.lockTn !== undefined) && (
          <p>
            <label>
              <input type="checkbox" checked={tools} onChange={(e) => setTools(e.target.checked)} /> {t('solo.dungeon.tools')}
            </label>
            {device && (
              <span role="status">
                {' '}
                {t(device.kind === 'search' ? 'solo.dungeon.searchRoll' : 'solo.dungeon.deviceRoll', { d1: device.roll.dice[0], d2: device.roll.dice[1], value: device.roll.value })} — {t(`solo.dungeon.${device.kind === 'search' ? 'search' : device.kind === 'trap' ? 'deviceTrap' : 'deviceLock'}${device.roll.success ? 'Ok' : 'Fail'}`)}
              </span>
            )}
          </p>
        )}
        <div className={styles.controls}>
          {here.kind === 'stairs' && here.id !== 0 && (
            <button type="button" onClick={() => setDungeon(descend(dungeon) ?? dungeon)}>
              {t('solo.dungeon.descend')}
            </button>
          )}
          {here.kind === 'stairs' && here.id === 0 && (
            <button type="button" onClick={() => setDungeon(ascend(dungeon) ?? dungeon)}>
              {t('solo.dungeon.ascend')}
            </button>
          )}
          {here.kind === 'entrance' && (
            <button type="button" onClick={() => setDungeon(null)}>
              {t('solo.dungeon.leave')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
