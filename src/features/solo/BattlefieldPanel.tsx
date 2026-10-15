import { useAtom, useAtomValue } from 'jotai';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { GameIcon } from '../../components/icons';
import { catalogIconKey, UI_ICON } from '../../components/icon-info';
import {
  CELL_METERS_MAX,
  CELL_METERS_MIN,
  cellAt,
  cellKey,
  clampInt,
  COLS_MAX,
  COLS_MIN,
  distanceMeters,
  freeCellNear,
  initials,
  labelNumber,
  layoutTokens,
  nudge,
  ROWS_MAX,
  ROWS_MIN,
  rowsForImage,
  type Cell,
  type FieldToken,
} from '../../lib/battlefield';
import { isDefeated, numberOf } from '../../lib/encounter';
import { deleteImage, fileToBlob, getImage, MAP_MAX_PX, putImage, TOKEN_MAX_PX } from '../../lib/image-store';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { CUSTOM_LIMIT, fieldAtom } from '../../state/battlefield';
import { encounterAtom, showMonsterHpAtom } from '../../state/encounter';
import { partyAtom } from '../../state/party';
import { useMonsters } from './useMonsters';
import styles from './BattlefieldPanel.module.css';

/** What a token needs beyond its place: the picture it falls back to, and the key its own picture is filed under. */
interface Token extends FieldToken {
  imageKey: string;
  avatar?: string;
  /** The race or monster category it wears an icon for when it has no picture. */
  icon?: ReturnType<typeof catalogIconKey>;
  /** "7 / 16" for the info line — shown only when the table's HP switch is on. */
  hp?: string;
}

/**
 * A number the player is typing: it is taken as soon as it lies within its limits, and until then (an empty box, a "4" on the
 * way to "46") the text is left alone instead of being clamped under the cursor. Leaving the box puts the stored value back.
 */
function NumberField({ label, value, min, max, step = 1, disabled, onCommit }: { label: string; value: number; min: number; max: number; step?: number; disabled?: boolean; onCommit: (value: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={draft ?? value}
        onChange={(event) => {
          setDraft(event.target.value);
          const typed = Number(event.target.value);
          if (event.target.value !== '' && Number.isFinite(typed) && typed >= min && typed <= max) onCommit(typed);
        }}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
}

/** A picture out of the store as an object URL, refreshed when `version` moves and let go of when it changes or the panel closes. */
function useStoredImage(key: string | null, version: number): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    let made: string | null = null;
    void getImage(key).then((blob) => {
      if (cancelled) return;
      made = blob ? URL.createObjectURL(blob) : null;
      setUrl(made);
    });
    return () => {
      cancelled = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [key, version]);
  return key ? url : null;
}

function TokenFace({ token, version }: { token: Token; version: number }) {
  const stored = useStoredImage(token.imageKey, version);
  const picture = stored ?? token.avatar ?? null;
  return (
    <span className={styles.disc}>
      {picture ? (
        <img src={picture} alt="" draggable={false} className={styles.tokenImage} />
      ) : token.icon ? (
        <GameIcon name={token.icon} size="68%" />
      ) : (
        <span className={styles.tokenInitials}>{initials(token.label)}</span>
      )}
    </span>
  );
}

/**
 * The battlefield (roadmap § 5.4): a square grid over an optional picture, with a token for the open character, each Fellow
 * and each monster on the table, and any the player adds. Drag a token (or move the focused one with the arrow keys); its
 * distances to the others read in metres. The DOM does the drawing: the grid is a background, tokens are buttons, so it
 * prints, scales to a phone and can be driven from the keyboard. The picture lives in IndexedDB, the rest in localStorage.
 */
export function BattlefieldPanel() {
  const { t } = useTranslation();
  const [field, setField] = useAtom(fieldAtom);
  const encounter = useAtomValue(encounterAtom);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const partyIds = useAtomValue(partyAtom);
  const showHp = useAtomValue(showMonsterHpAtom);
  const { byId } = useMonsters();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; cell: Cell } | null>(null);
  const [imageVersion, setImageVersion] = useState(0);
  const [newLabel, setNewLabel] = useState('');
  const [failed, setFailed] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const mapInput = useRef<HTMLInputElement>(null);
  const tokenInput = useRef<HTMLInputElement>(null);

  const rows = field.hasMap && field.mapRatio > 0 ? rowsForImage(field.cols, 1, field.mapRatio) : field.rows;
  const mapUrl = useStoredImage(field.hasMap ? 'map' : null, imageVersion);

  const tokens = useMemo<Token[]>(() => {
    const list: Token[] = [];
    const seen = new Set<string>();
    const addCharacter = (id: string) => {
      const character = characters.find((entry) => entry.id === id);
      if (!character || seen.has(id)) return;
      seen.add(id);
      list.push({
        id: `pc:${id}`,
        label: character.name,
        side: 'party',
        imageKey: `token:pc:${id}`,
        avatar: character.profile.avatar || undefined,
        icon: catalogIconKey('race', character.raceId),
      });
    };
    if (activeId) addCharacter(activeId);
    partyIds.forEach(addCharacter);
    for (const instance of encounter.monsters) {
      const monster = byId.get(instance.monsterId);
      const main = monster ? Math.max(0, monster.mainSection ? monster.sections.findIndex((section) => monster.mainSection && section.style.includes(`(${monster.mainSection})`)) : 0) : 0;
      list.push({
        id: `foe:${instance.id}`,
        label: instance.label,
        side: 'foe',
        down: monster ? isDefeated(monster, instance) : false,
        imageKey: `token:monster:${instance.monsterId}`,
        icon: monster ? catalogIconKey('monster', monster.category) : undefined,
        hp: monster && instance.sections[main] ? `${instance.sections[main].hp} / ${numberOf(monster.sections[main].hp)}` : undefined,
      });
    }
    for (const custom of field.custom) list.push({ id: `custom:${custom.id}`, label: custom.label, side: 'custom', imageKey: `token:custom:${custom.id}` });
    return list;
  }, [characters, activeId, partyIds, encounter.monsters, byId, field.custom]);

  const placed = useMemo(() => layoutTokens(tokens, field.positions, field.cols, rows), [tokens, field.positions, field.cols, rows]);
  const selected = tokens.find((token) => token.id === selectedId) ?? null;
  const selectedFace = useStoredImage(selected?.imageKey ?? null, imageVersion);

  function place(id: string, wanted: Cell) {
    const occupied = new Set(tokens.filter((token) => token.id !== id).map((token) => cellKey(placed[token.id])));
    const cell = freeCellNear(wanted, occupied, field.cols, rows);
    setField((current) => ({ ...current, positions: { ...placed, [id]: cell } }));
  }

  function cellFromPointer(event: PointerEvent): Cell {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { col: 0, row: 0 };
    return cellAt(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height, field.cols, rows);
  }

  function onPointerDown(token: Token, event: PointerEvent<HTMLButtonElement>) {
    setSelectedId(token.id);
    setDrag({ id: token.id, cell: placed[token.id] });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(token: Token, event: PointerEvent<HTMLButtonElement>) {
    if (drag?.id === token.id) setDrag({ id: token.id, cell: cellFromPointer(event) });
  }

  function onPointerUp(token: Token, event: PointerEvent<HTMLButtonElement>) {
    if (drag?.id !== token.id) return;
    const cell = cellFromPointer(event);
    setDrag(null);
    if (cellKey(cell) !== cellKey(placed[token.id])) place(token.id, cell);
  }

  function onKeyDown(token: Token, event: KeyboardEvent<HTMLButtonElement>) {
    const step: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const move = step[event.key];
    if (!move) return;
    event.preventDefault();
    place(token.id, nudge(placed[token.id], move[0], move[1], field.cols, rows));
  }

  async function chooseMap(file: File | undefined) {
    if (!file) return;
    setFailed(false);
    try {
      const { blob, width, height } = await fileToBlob(file, MAP_MAX_PX, 'image/jpeg');
      await putImage('map', blob);
      setField((current) => ({ ...current, hasMap: true, mapRatio: height / width }));
      setImageVersion((version) => version + 1);
    } catch {
      setFailed(true);
    }
  }

  async function removeMap() {
    await deleteImage('map');
    setField((current) => ({ ...current, hasMap: false, mapRatio: 0 }));
    setImageVersion((version) => version + 1);
  }

  async function chooseTokenImage(file: File | undefined) {
    if (!file || !selected) return;
    setFailed(false);
    try {
      const { blob } = await fileToBlob(file, TOKEN_MAX_PX, 'image/png');
      await putImage(selected.imageKey, blob);
      setImageVersion((version) => version + 1);
    } catch {
      setFailed(true);
    }
  }

  async function clearTokenImage() {
    if (!selected) return;
    await deleteImage(selected.imageKey);
    setImageVersion((version) => version + 1);
  }

  function addCustom() {
    const label = newLabel.trim();
    if (!label || field.custom.length >= CUSTOM_LIMIT) return;
    const id = crypto.randomUUID();
    setField((current) => ({ ...current, custom: [...current.custom, { id, label }] }));
    setSelectedId(`custom:${id}`);
    setNewLabel('');
  }

  function removeCustom(token: Token) {
    const id = token.id.slice('custom:'.length);
    void deleteImage(token.imageKey);
    setField((current) => ({ ...current, custom: current.custom.filter((entry) => entry.id !== id), positions: Object.fromEntries(Object.entries(current.positions).filter(([key]) => key !== token.id)) }));
    setSelectedId(null);
  }

  const distances = selected
    ? tokens
        .filter((token) => token.id !== selected.id)
        .map((token) => ({ token, meters: distanceMeters(placed[selected.id], placed[token.id], field.cellMeters) }))
        .sort((a, b) => a.meters - b.meters)
    : [];

  const gridLines = field.showGrid
    ? {
        backgroundImage: 'linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)',
        backgroundSize: `${100 / field.cols}% ${100 / rows}%`,
      }
    : undefined;

  return (
    <section className={styles.panel} aria-labelledby="battlefield-title">
      <div>
        <h3 id="battlefield-title">{t('solo.field.title')}</h3>
        <p className={styles.note}>{t('solo.field.intro')}</p>
      </div>

      <div className={styles.settings}>
        <NumberField label={t('solo.field.cols')} value={field.cols} min={COLS_MIN} max={COLS_MAX} onCommit={(cols) => setField((current) => ({ ...current, cols: clampInt(cols, COLS_MIN, COLS_MAX) }))} />
        <NumberField label={t('solo.field.rows')} value={rows} min={ROWS_MIN} max={ROWS_MAX} disabled={field.hasMap} onCommit={(value) => setField((current) => ({ ...current, rows: clampInt(value, ROWS_MIN, ROWS_MAX) }))} />
        <NumberField label={t('solo.field.cellMeters')} value={field.cellMeters} min={CELL_METERS_MIN} max={CELL_METERS_MAX} step={0.5} onCommit={(cellMeters) => setField((current) => ({ ...current, cellMeters }))} />
        <label className={styles.inline}>
          <input type="checkbox" checked={field.showGrid} onChange={(event) => setField((current) => ({ ...current, showGrid: event.target.checked }))} />
          {t('solo.field.showGrid')}
        </label>
        <button type="button" onClick={() => mapInput.current?.click()}>
          <ImagePlus {...UI_ICON} />
          {t('solo.field.uploadMap')}
        </button>
        <input ref={mapInput} type="file" accept="image/*" hidden aria-label={t('solo.field.uploadMap')} onChange={(event) => { void chooseMap(event.target.files?.[0]); event.target.value = ''; }} />
        {field.hasMap && (
          <button type="button" onClick={() => void removeMap()}>
            <Trash2 {...UI_ICON} />
            {t('solo.field.removeMap')}
          </button>
        )}
        <button type="button" onClick={() => setField((current) => ({ ...current, positions: {} }))}>
          {t('solo.field.resetLayout')}
        </button>
      </div>
      {failed && <p role="alert" className={styles.error}>{t('solo.field.pictureFailed')}</p>}

      <div className={styles.addRow}>
        <input type="text" maxLength={40} value={newLabel} placeholder={t('solo.field.tokenName')} aria-label={t('solo.field.tokenName')} onChange={(event) => setNewLabel(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addCustom()} />
        <button type="button" onClick={addCustom} disabled={!newLabel.trim() || field.custom.length >= CUSTOM_LIMIT}>
          {t('solo.field.addToken')}
        </button>
      </div>

      <p className={styles.note}>{t('solo.field.hint')}</p>

      <div className={styles.frame}>
        <div
          ref={fieldRef}
          className={styles.field}
          role="group"
          aria-label={t('solo.field.label')}
          style={{ aspectRatio: `${field.cols} / ${rows}`, backgroundImage: mapUrl ? `url(${mapUrl})` : undefined }}
        >
          <div className={styles.grid} style={gridLines} />
          {tokens.map((token) => {
            const cell = drag?.id === token.id ? drag.cell : placed[token.id];
            const number = token.side === 'foe' ? labelNumber(token.label) : '';
            return (
              <button
                key={token.id}
                type="button"
                className={`${styles.token} ${styles[token.side]} ${token.down ? styles.down : ''} ${selectedId === token.id ? styles.selected : ''} ${drag?.id === token.id ? styles.dragging : ''}`}
                style={{ left: `${(cell.col / field.cols) * 100}%`, top: `${(cell.row / rows) * 100}%`, width: `${100 / field.cols}%`, height: `${100 / rows}%` }}
                aria-label={t('solo.field.tokenAria', { label: token.label, side: t(`solo.field.side.${token.side}`), col: cell.col + 1, row: cell.row + 1 })}
                aria-pressed={selectedId === token.id}
                title={token.label}
                onPointerDown={(event) => onPointerDown(token, event)}
                onPointerMove={(event) => onPointerMove(token, event)}
                onPointerUp={(event) => onPointerUp(token, event)}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={(event) => onKeyDown(token, event)}
                onClick={() => setSelectedId(token.id)}
              >
                <TokenFace token={token} version={imageVersion} />
                {number && <span className={styles.badge}>{number}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div className={styles.info} role="region" aria-label={t('solo.field.selected')}>
          <p>
            <strong>{selected.label}</strong> · {t(`solo.field.side.${selected.side}`)}
            {selected.down && ` · ${t('solo.field.down')}`}
            {showHp && selected.hp && ` · HP ${selected.hp}`}
          </p>
          <div className={styles.settings}>
            <button type="button" onClick={() => tokenInput.current?.click()}>
              <ImagePlus {...UI_ICON} />
              {t('solo.field.uploadToken')}
            </button>
            <input ref={tokenInput} type="file" accept="image/*" hidden aria-label={t('solo.field.uploadToken')} onChange={(event) => { void chooseTokenImage(event.target.files?.[0]); event.target.value = ''; }} />
            {selectedFace && (
              <button type="button" onClick={() => void clearTokenImage()}>
                {t('solo.field.clearToken')}
              </button>
            )}
            {selected.side === 'custom' && (
              <button type="button" onClick={() => removeCustom(selected)}>
                <Trash2 {...UI_ICON} />
                {t('solo.field.removeToken')}
              </button>
            )}
          </div>
          {distances.length > 0 ? (
            <ul className={styles.distances} aria-label={t('solo.field.distances', { label: selected.label })}>
              {distances.map(({ token, meters }) => (
                <li key={token.id}>
                  {token.label}: {meters} {t('solo.field.metres')}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.note}>{t('solo.field.alone')}</p>
          )}
        </div>
      ) : (
        <p className={styles.note}>{t('solo.field.pick')}</p>
      )}
    </section>
  );
}
