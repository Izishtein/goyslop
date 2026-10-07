import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Monster } from '../../data/monsters';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { spawnMonster } from '../../lib/encounter';
import {
  ascend,
  canEnter,
  currentRoom,
  descend,
  enterRoom,
  generateDungeon,
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
const GLYPH: Record<string, string> = { entrance: '⌂', empty: '·', monsters: '☠', trap: '⚠', treasure: '$', special: '✦', hazard: '≈', secret: '?!', stairs: '≣', boss: '♛' };

export function DungeonPanel() {
  const { t } = useTranslation();
  const [dungeon, setDungeon] = useAtom(dungeonAtom);
  const setEncounter = useSetAtom(encounterAtom);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const updateCharacter = useUpdateCharacter(activeId ?? '');
  const { monsters, byId } = useMonsters();
  const [biome, setBiome] = useState<Biome>('hills');

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

  const monster = here.monsterId ? byId.get(here.monsterId) : undefined;
  const label = (room: Room) => `${t(`solo.dungeon.kinds.${room.visited ? room.kind : 'unknown'}`)}${room === here ? ` — ${t('solo.dungeon.youAreHere')}` : ''}`;

  return (
    <section className={styles.panel} aria-labelledby="solo-dungeon">
      <div className={styles.panelHead}>
        <h3 id="solo-dungeon">{t('solo.dungeon.title')}</h3>
        <p className={styles.note}>
          {t(`solo.dungeon.themes.${dungeon.theme}`)} · {t('solo.dungeon.depth', { level: dungeon.at.level + 1, total: dungeon.levels.length })} · {t('solo.dungeon.forLevel', { level: dungeon.level })}
        </p>
      </div>

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
        {here.trap !== undefined && <p>{t(`solo.dungeon.traps.${here.trap}`)}</p>}
        {here.hazard !== undefined && <p>{t(`solo.dungeon.hazards.${here.hazard}`)}</p>}
        {here.special !== undefined && <p>{t(`solo.dungeon.specials.${here.special}`)}</p>}
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
            {here.item && here.gold > 0 && ` ${t('solo.dungeon.hoardItem')}`}{' '}
            {here.gold > 0 && (
              <button type="button" onClick={takeGold} disabled={!activeId}>
                {t('solo.dungeon.takeGold', { gold: here.gold })}
              </button>
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
