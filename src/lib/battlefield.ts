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
