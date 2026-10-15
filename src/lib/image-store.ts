/*
 * Pictures for the battlefield: a map is far bigger than the few megabytes localStorage gives the whole origin (and a roster
 * lives there), so pictures go to IndexedDB as Blobs, downscaled first. Where IndexedDB is missing or refuses (a private
 * window, a test) they are kept for the life of the page instead, and nothing throws: the field still works, the picture is
 * just not remembered.
 */
const DB_NAME = 'sw25-images';
const STORE = 'images';

const memory = new Map<string, Blob>();

function open(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  const db = await open();
  if (!db) return undefined;
  try {
    return await new Promise<T | undefined>((resolve) => {
      const request = work(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  } finally {
    db.close();
  }
}

export async function putImage(key: string, blob: Blob): Promise<void> {
  memory.set(key, blob);
  await run('readwrite', (store) => store.put(blob, key));
}

export async function getImage(key: string): Promise<Blob | undefined> {
  const stored = await run<Blob | undefined>('readonly', (store) => store.get(key));
  return stored instanceof Blob ? stored : memory.get(key);
}

export async function deleteImage(key: string): Promise<void> {
  memory.delete(key);
  await run('readwrite', (store) => store.delete(key));
}

/** Longest side of a map and of a token picture after downscaling, in pixels. */
export const MAP_MAX_PX = 2400;
export const TOKEN_MAX_PX = 192;

/** The picture, no larger than `max` on its longest side, as a Blob (JPEG for a map, PNG for a token to keep transparency), with its size. */
export async function fileToBlob(file: File, max: number, type: 'image/jpeg' | 'image/png'): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    if (!blob) throw new Error('Could not encode the picture');
    return { blob, width, height };
  } finally {
    bitmap.close();
  }
}
