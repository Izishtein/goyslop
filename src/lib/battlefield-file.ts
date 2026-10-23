import { FieldSchema, type Field } from '../state/battlefield';
import { getImage, putImage } from './image-store';

/*
 * The battlefield as a file (roadmap 5.4): the grid, the cells, the fog and the pictures in one JSON, so a map can be kept,
 * sent to another table or brought back after the browser forgot it. Pictures ride along as data URLs under the keys the
 * image store files them by.
 */
export const FIELD_FILE_KIND = 'sw25-battlefield';
export const FIELD_FILE_VERSION = 1;

export interface FieldFile {
  kind: typeof FIELD_FILE_KIND;
  version: number;
  field: Field;
  images: Record<string, string>;
}

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export function dataUrlToBlob(url: string): Blob | null {
  const match = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(url);
  if (!match) return null;
  try {
    const bytes = match[2] ? Uint8Array.from(atob(match[3]), (char) => char.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(match[3]));
    return new Blob([bytes], { type: match[1] || 'application/octet-stream' });
  } catch {
    return null;
  }
}

/** The field with the pictures stored under `imageKeys` that exist, as the text of a file. */
export async function exportField(field: Field, imageKeys: readonly string[]): Promise<string> {
  const images: Record<string, string> = {};
  for (const key of imageKeys) {
    const blob = await getImage(key);
    if (blob) images[key] = await blobToDataUrl(blob);
  }
  const file: FieldFile = { kind: FIELD_FILE_KIND, version: FIELD_FILE_VERSION, field, images };
  return JSON.stringify(file);
}

export type ParsedField = { ok: true; field: Field; images: Record<string, string> } | { ok: false };

/** A field out of the text of a file, or `ok: false` when it is not one of ours (nothing is trusted, everything is validated). */
export function parseFieldFile(text: string): ParsedField {
  try {
    const data: unknown = JSON.parse(text);
    if (typeof data !== 'object' || data === null) return { ok: false };
    const record = data as Record<string, unknown>;
    if (record.kind !== FIELD_FILE_KIND || typeof record.version !== 'number' || record.version > FIELD_FILE_VERSION) return { ok: false };
    const field = FieldSchema.safeParse(record.field);
    if (!field.success) return { ok: false };
    const images: Record<string, string> = {};
    if (typeof record.images === 'object' && record.images !== null) {
      for (const [key, value] of Object.entries(record.images)) {
        if (typeof value === 'string' && value.startsWith('data:image/') && (key === 'map' || key.startsWith('token:'))) images[key] = value;
      }
    }
    return { ok: true, field: field.data, images };
  } catch {
    return { ok: false };
  }
}

/** Puts the pictures of a parsed file into the image store; returns how many could not be decoded. */
export async function importImages(images: Record<string, string>): Promise<number> {
  let skipped = 0;
  for (const [key, url] of Object.entries(images)) {
    const blob = dataUrlToBlob(url);
    if (blob) await putImage(key, blob);
    else skipped += 1;
  }
  return skipped;
}
