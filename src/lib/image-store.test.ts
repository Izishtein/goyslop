import { describe, expect, it } from 'vitest';
import { deleteImage, getImage, putImage } from './image-store';

describe('image store without IndexedDB', () => {
  it('keeps a picture for the life of the page and lets it go', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    await putImage('a', blob);
    expect(await getImage('a')).toBe(blob);
    await deleteImage('a');
    expect(await getImage('a')).toBeUndefined();
  });

  it('answers nothing for a picture never stored', async () => {
    expect(await getImage('never')).toBeUndefined();
  });
});
