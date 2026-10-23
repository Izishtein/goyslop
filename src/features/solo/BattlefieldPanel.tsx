import { useAtom, useAtomValue } from 'jotai';
import { Download, ImagePlus, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { GameIcon } from '../../components/icons';
import { catalogIconKey, UI_ICON } from '../../components/icon-info';
import {
  CELL_METERS_MAX,
  CELL_METERS_MIN,
  cellAt,
  cellKey,
  centreOf,
  clampInt,
  COLS_MAX,
  COLS_MIN,
  distanceMeters,
  FOG_SIGHT_MAX,
  fogPath,
  freeCellNear,
  initials,
  labelNumber,
  layoutTokens,
  nudge,
  ROWS_MAX,
  ROWS_MIN,
  rowsForImage,
  rulerReadout,
  setRevealed,
  visibleCells,
  withinRadius,
  type Cell,
  type FieldToken,
} from '../../lib/battlefield';
import { isDefeated, numberOf } from '../../lib/encounter';
import { exportField, importImages, parseFieldFile } from '../../lib/battlefield-file';
import { deleteImage, fileToBlob, getImage, MAP_MAX_PX, putImage, TOKEN_MAX_PX } from '../../lib/image-store';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { CUSTOM_LIMIT, fieldAtom } from '../../state/battlefield';
import { encounterAtom, showMonsterHpAtom } from '../../state/encounter';
import { partyAtom } from '../../state/party';
import { downloadText } from './downloadText';
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
  /** What a click on the field does: nothing (tokens are dragged), lays the ruler, or opens / covers fog cells. */
  const [tool, setTool] = useState<'none' | 'ruler' | 'reveal' | 'cover'>('none');
  const [rulerPoints, setRulerPoints] = useState<Cell[]>([]);
  const [radius, setRadius] = useState(0);
  const [painting, setPainting] = useState(false);
  const [fileError, setFileError] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
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
  const { fog } = field;
  const visible = useMemo(
    () => visibleCells(fog, tokens.filter((token) => token.side === 'party').map((token) => placed[token.id]), field.cellMeters, field.cols, rows),
    [fog, tokens, placed, field.cellMeters, field.cols, rows],
  );
  /** Under fog a foe in a cell nobody has seen is not on the field, nor in the lists. */
  const shown = useMemo(() => tokens.filter((token) => !(fog.on && token.side === 'foe' && !visible.has(cellKey(placed[token.id])))), [tokens, fog.on, visible, placed]);
  const covered = useMemo(() => (fog.on ? fogPath(visible, field.cols, rows) : ''), [fog.on, visible, field.cols, rows]);
  const selected = shown.find((token) => token.id === selectedId) ?? null;
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
    if (selectedId !== token.id) setRadius(0);
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

  function pickCell(event: PointerEvent) {
    const cell = cellFromPointer(event);
    if (tool === 'ruler') {
      setRulerPoints((points) => (points.length >= 2 ? [cell] : [...points, cell]));
      return;
    }
    setPainting(true);
    paint(cell);
  }

  function paint(cell: Cell) {
    setField((current) => {
      const revealed = setRevealed(current.fog.revealed, cell, tool === 'reveal');
      return revealed === current.fog.revealed ? current : { ...current, fog: { ...current.fog, revealed } };
    });
  }

  async function exportFile() {
    const text = await exportField(field, ['map', ...tokens.map((token) => token.imageKey)]);
    downloadText('battlefield.sw25field.json', text, 'application/json');
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    const parsed = parseFieldFile(await file.text());
    setFileError(!parsed.ok);
    if (!parsed.ok) return;
    await importImages(parsed.images);
    setField(parsed.field);
    setSelectedId(null);
    setRulerPoints([]);
    setImageVersion((version) => version + 1);
  }

  const ruler = rulerPoints.length === 2 ? rulerReadout(rulerPoints[0], rulerPoints[1], field.cellMeters) : null;
  const inRadius = selected && radius > 0 ? shown.filter((token) => token.id !== selected.id && withinRadius(placed[selected.id], placed[token.id], radius, field.cellMeters)) : [];

  const distances = selected
    ? shown
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
        <h3 id="battlefield-title"><GameIcon name="solo.battlefield" />{t('solo.field.title')}</h3>
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
        <button type="button" onClick={() => void exportFile()}>
          <Download {...UI_ICON} />
          {t('solo.field.export')}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>
          <Upload {...UI_ICON} />
          {t('solo.field.import')}
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" hidden aria-label={t('solo.field.import')} onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ''; }} />
      </div>
      {failed && <p role="alert" className={styles.error}>{t('solo.field.pictureFailed')}</p>}
      {fileError && <p role="alert" className={styles.error}>{t('solo.field.fileFailed')}</p>}

      <div className={styles.settings} role="group" aria-label={t('solo.field.tools')}>
        <label>
          {t('solo.field.tool')}
          <select value={tool} onChange={(event) => { setTool(event.target.value as typeof tool); setRulerPoints([]); }}>
            <option value="none">{t('solo.field.toolNone')}</option>
            <option value="ruler">{t('solo.field.toolRuler')}</option>
            {fog.on && <option value="reveal">{t('solo.field.toolReveal')}</option>}
            {fog.on && <option value="cover">{t('solo.field.toolCover')}</option>}
          </select>
        </label>
        <label className={styles.inline}>
          <input
            type="checkbox"
            checked={fog.on}
            onChange={(event) => {
              const on = event.target.checked;
              if (!on) setTool((current) => (current === 'reveal' || current === 'cover' ? 'none' : current));
              setField((current) => ({ ...current, fog: { ...current.fog, on } }));
            }}
          />
          {t('solo.field.fog')}
        </label>
        {fog.on && (
          <>
            <NumberField label={t('solo.field.sight')} value={fog.sight} min={0} max={FOG_SIGHT_MAX} step={0.5} onCommit={(sight) => setField((current) => ({ ...current, fog: { ...current.fog, sight } }))} />
            <button type="button" onClick={() => setField((current) => ({ ...current, fog: { ...current.fog, revealed: [] } }))} disabled={fog.revealed.length === 0}>
              {t('solo.field.fogCover')}
            </button>
            <button
              type="button"
              onClick={() => setField((current) => ({ ...current, fog: { ...current.fog, revealed: Array.from({ length: current.cols * rows }, (_, i) => cellKey({ col: i % current.cols, row: Math.floor(i / current.cols) })) } }))}
            >
              {t('solo.field.fogReveal')}
            </button>
          </>
        )}
      </div>
      {ruler && (
        <p className={styles.note} role="status">
          {t('solo.field.rulerReadout', { meters: ruler.meters, cells: ruler.cells })}
        </p>
      )}

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
          <svg className={styles.overlay} viewBox={`0 0 ${field.cols} ${rows}`} preserveAspectRatio="none" aria-hidden="true">
            {covered && <path d={covered} className={styles.fog} />}
            {selected && radius > 0 && <circle cx={centreOf(placed[selected.id]).x} cy={centreOf(placed[selected.id]).y} r={radius / field.cellMeters} className={styles.radius} />}
            {rulerPoints.length > 0 && rulerPoints.map((point) => <circle key={cellKey(point)} cx={centreOf(point).x} cy={centreOf(point).y} r={0.18} className={styles.rulerDot} />)}
            {rulerPoints.length === 2 && <line x1={centreOf(rulerPoints[0]).x} y1={centreOf(rulerPoints[0]).y} x2={centreOf(rulerPoints[1]).x} y2={centreOf(rulerPoints[1]).y} className={styles.rulerLine} />}
          </svg>
          {shown.map((token) => {
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
                onClick={() => { if (selectedId !== token.id) setRadius(0); setSelectedId(token.id); }}
              >
                <TokenFace token={token} version={imageVersion} />
                {number && <span className={styles.badge}>{number}</span>}
              </button>
            );
          })}
          {tool !== 'none' && (
            <div
              className={styles.capture}
              data-testid="field-capture"
              onPointerDown={(event) => pickCell(event)}
              onPointerMove={(event) => painting && paint(cellFromPointer(event))}
              onPointerUp={() => setPainting(false)}
              onPointerCancel={() => setPainting(false)}
              onPointerLeave={() => setPainting(false)}
            />
          )}
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
          <div className={styles.settings}>
            <NumberField label={t('solo.field.radius')} value={radius} min={0} max={100} step={0.5} onCommit={setRadius} />
            {[3, 6, 10, 20].map((meters) => (
              <button key={meters} type="button" aria-pressed={radius === meters} onClick={() => setRadius(radius === meters ? 0 : meters)}>
                {meters} {t('solo.field.metres')}
              </button>
            ))}
          </div>
          {radius > 0 && (
            <p className={styles.note} role="status">
              {inRadius.length > 0 ? t('solo.field.inRadius', { radius, list: inRadius.map((token) => token.label).join(', ') }) : t('solo.field.noneInRadius', { radius })}
            </p>
          )}
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
