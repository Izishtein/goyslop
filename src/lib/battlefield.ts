/*
 * The battlefield (roadmap § 5.4): a square grid, an optional picture under it, and tokens that stand in cells.
 * Everything here is arithmetic on cells; drawing and the picture store live elsewhere. Rows and columns count from 0
 * at the top left.
 */

export interface Cell {
  col: number;
  row: number;
}

export const COLS_MIN = 4;
export const COLS_MAX = 60;
export const ROWS_MIN = 4;
export const ROWS_MAX = 60;
export const CELL_METERS_MIN = 0.5;
export const CELL_METERS_MAX = 30;

export interface FieldSettings {
  cols: number;
  rows: number;
  /** The length of a cell's side in metres: what the distance readout multiplies by. */
  cellMeters: number;
  showGrid: boolean;
}

export const DEFAULT_SETTINGS: FieldSettings = { cols: 20, rows: 14, cellMeters: 1, showGrid: true };

export type TokenSide = 'party' | 'foe' | 'custom';

export interface FieldToken {
  id: string;
  label: string;
  side: TokenSide;
  /** A monster section group is down: the token stays, greyed. */
  down?: boolean;
}

export const clampInt = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));

export const clampCell = (cell: Cell, cols: number, rows: number): Cell => ({ col: clampInt(cell.col, 0, cols - 1), row: clampInt(cell.row, 0, rows - 1) });

export const cellKey = (cell: Cell): string => `${cell.col},${cell.row}`;

/** The cell under a point of the field, `x` and `y` measured from its top left corner and `width` x `height` its size. */
export function cellAt(x: number, y: number, width: number, height: number, cols: number, rows: number): Cell {
  return clampCell({ col: Math.floor((x / width) * cols), row: Math.floor((y / height) * rows) }, cols, rows);
}

/** One step of a token, kept on the field. */
export const nudge = (cell: Cell, dCol: number, dRow: number, cols: number, rows: number): Cell => clampCell({ col: cell.col + dCol, row: cell.row + dRow }, cols, rows);

/** Rows that keep square cells under a picture `width` x `height` when there are `cols` columns. */
export const rowsForImage = (cols: number, width: number, height: number): number =>
  width > 0 && height > 0 ? clampInt((cols * height) / width, ROWS_MIN, ROWS_MAX) : DEFAULT_SETTINGS.rows;

/** Straight-line distance between the centres of two cells, in metres, to a tenth. */
export function distanceMeters(a: Cell, b: Cell, cellMeters: number): number {
  return Math.round(Math.hypot(a.col - b.col, a.row - b.row) * cellMeters * 10) / 10;
}

/**
 * The nearest cell to `wanted` that nobody stands in (searching outwards ring by ring, closest first): two tokens in one
 * cell would hide each other. `wanted` itself when it is free.
 */
export function freeCellNear(wanted: Cell, occupied: ReadonlySet<string>, cols: number, rows: number): Cell {
  const start = clampCell(wanted, cols, rows);
  if (!occupied.has(cellKey(start))) return start;
  const limit = Math.max(cols, rows);
  for (let radius = 1; radius <= limit; radius += 1) {
    const ring: Cell[] = [];
    for (let dRow = -radius; dRow <= radius; dRow += 1) {
      for (let dCol = -radius; dCol <= radius; dCol += 1) {
        if (Math.max(Math.abs(dCol), Math.abs(dRow)) !== radius) continue;
        const col = start.col + dCol;
        const row = start.row + dRow;
        if (col >= 0 && col < cols && row >= 0 && row < rows && !occupied.has(cellKey({ col, row }))) ring.push({ col, row });
      }
    }
    ring.sort((p, q) => Math.hypot(p.col - start.col, p.row - start.row) - Math.hypot(q.col - start.col, q.row - start.row));
    if (ring[0]) return ring[0];
  }
  return start;
}

/**
 * Where every token stands: the stored cell, or for a token never placed a starting cell — the party in a row from the top
 * left, foes in a row from the bottom left, others after the party — wrapping at the edge and skipping occupied cells.
 */
export function layoutTokens(tokens: readonly FieldToken[], stored: Readonly<Record<string, Cell>>, cols: number, rows: number): Record<string, Cell> {
  const placed: Record<string, Cell> = {};
  const occupied = new Set<string>();
  for (const token of tokens) {
    const cell = stored[token.id];
    if (!cell) continue;
    const clamped = clampCell(cell, cols, rows);
    placed[token.id] = clamped;
    occupied.add(cellKey(clamped));
  }
  const nextSlot: Record<TokenSide, number> = { party: 0, custom: 0, foe: 0 };
  for (const token of tokens) {
    if (placed[token.id]) continue;
    const slot = nextSlot[token.side]++;
    const wanted: Cell =
      token.side === 'foe'
        ? { col: slot % cols, row: rows - 1 - Math.floor(slot / cols) }
        : { col: slot % cols, row: token.side === 'party' ? Math.floor(slot / cols) : 2 + Math.floor(slot / cols) };
    const cell = freeCellNear(wanted, occupied, cols, rows);
    placed[token.id] = cell;
    occupied.add(cellKey(cell));
  }
  return placed;
}

/** The trailing number of a label ("Goblin 2" -> "2"), which tells copies of one monster apart on a small token. */
export const labelNumber = (label: string): string => /\s(\d+)$/.exec(label)?.[1] ?? '';

/** Two letters for a token with no picture and no icon. */
export function initials(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase();
}

/** The cell's centre in cell units, which is where a ruler, a radius and a sight line are measured from. */
export const centreOf = (cell: Cell): { x: number; y: number } => ({ x: cell.col + 0.5, y: cell.row + 0.5 });

/** What a ruler laid from `a` to `b` reads: the straight line in metres, and the cells a walker counts (diagonals as one). */
export function rulerReadout(a: Cell, b: Cell, cellMeters: number): { meters: number; cells: number } {
  return { meters: distanceMeters(a, b, cellMeters), cells: Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row)) };
}

/** Whether a cell's centre lies within `meters` of `centre`'s centre: how an area spell decides who stands in it. */
export const withinRadius = (centre: Cell, cell: Cell, meters: number, cellMeters: number): boolean => Math.hypot(centre.col - cell.col, centre.row - cell.row) * cellMeters <= meters + 1e-9;

/** The cells (as keys) in the radius of a point, the point's own cell included. */
export function cellsWithin(centre: Cell, meters: number, cellMeters: number, cols: number, rows: number): Set<string> {
  const reach = Math.ceil(meters / cellMeters);
  const found = new Set<string>();
  for (let row = Math.max(0, centre.row - reach); row <= Math.min(rows - 1, centre.row + reach); row += 1) {
    for (let col = Math.max(0, centre.col - reach); col <= Math.min(cols - 1, centre.col + reach); col += 1) {
      if (withinRadius(centre, { col, row }, meters, cellMeters)) found.add(cellKey({ col, row }));
    }
  }
  return found;
}

export const FOG_SIGHT_MAX = 100;

/** Fog of war: switched on or off, how far the party sees on its own (0 = only the cells opened by hand), the opened cells. */
export interface Fog {
  on: boolean;
  sight: number;
  revealed: string[];
}

export const NO_FOG: Fog = { on: false, sight: 0, revealed: [] };

/** The cells not under fog: the ones opened by hand, and everything within sight of a party token. */
export function visibleCells(fog: Fog, watchers: readonly Cell[], cellMeters: number, cols: number, rows: number): Set<string> {
  const seen = new Set(fog.revealed);
  if (fog.sight > 0) {
    for (const watcher of watchers) for (const key of cellsWithin(watcher, fog.sight, cellMeters, cols, rows)) seen.add(key);
  }
  return seen;
}

/** One SVG path (in cell units) that covers every cell not in `visible`; runs along a row are merged into one rectangle. */
export function fogPath(visible: ReadonlySet<string>, cols: number, rows: number): string {
  const parts: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    let start = -1;
    for (let col = 0; col <= cols; col += 1) {
      const covered = col < cols && !visible.has(cellKey({ col, row }));
      if (covered && start < 0) start = col;
      if (!covered && start >= 0) {
        parts.push(`M${start} ${row}h${col - start}v1h${start - col}z`);
        start = -1;
      }
    }
  }
  return parts.join('');
}

/** `revealed` with one cell opened or closed again; the same array when nothing changes. */
export function setRevealed(revealed: readonly string[], cell: Cell, open: boolean): string[] {
  const key = cellKey(cell);
  const has = revealed.includes(key);
  if (open === has) return revealed as string[];
  return open ? [...revealed, key] : revealed.filter((entry) => entry !== key);
}
