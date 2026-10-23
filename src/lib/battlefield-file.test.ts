import { describe, expect, it } from 'vitest';
import { EMPTY_FIELD } from '../state/battlefield';
import { dataUrlToBlob, exportField, parseFieldFile } from './battlefield-file';
import { putImage } from './image-store';

describe('battlefield file', () => {
  it('round-trips the field and its pictures', async () => {
    const field = { ...EMPTY_FIELD, cols: 30, positions: { 'pc:a': { col: 3, row: 4 } }, custom: [{ id: 'c1', label: 'Door' }], fog: { on: true, sight: 6, revealed: ['1,1'] } };
    await putImage('token:custom:c1', new Blob(['png-bytes'], { type: 'image/png' }));
    const text = await exportField(field, ['token:custom:c1', 'map']);
    const parsed = parseFieldFile(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.field).toEqual(field);
    expect(Object.keys(parsed.images)).toEqual(['token:custom:c1']);
    const blob = dataUrlToBlob(parsed.images['token:custom:c1']);
    expect(blob?.type).toBe('image/png');
    expect(blob?.size).toBe('png-bytes'.length);
  });

  it('refuses what is not a battlefield, and drops pictures under foreign keys', () => {
    expect(parseFieldFile('not json').ok).toBe(false);
    expect(parseFieldFile('{"kind":"other","version":1,"field":{}}').ok).toBe(false);
    expect(parseFieldFile(JSON.stringify({ kind: 'sw25-battlefield', version: 99, field: {} })).ok).toBe(false);
    expect(parseFieldFile(JSON.stringify({ kind: 'sw25-battlefield', version: 1, field: { cols: 9999 } })).ok).toBe(false);
    const parsed = parseFieldFile(JSON.stringify({ kind: 'sw25-battlefield', version: 1, field: {}, images: { evil: 'data:image/png;base64,AA==', map: 'javascript:1' } }));
    expect(parsed).toMatchObject({ ok: true, images: {} });
  });
});
