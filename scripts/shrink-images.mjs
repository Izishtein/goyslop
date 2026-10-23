// Shrinks PNGs (with or without transparency) to JPEGs on a white ground, in the installed Edge, after cutting away the
// empty margin (transparent or near-white) around the picture.
// Needs: npm install --no-save playwright
// Usage: node scripts/shrink-images.mjs <maxPx> <quality 0-1> <src.png>=<dest.jpg> ...
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [maxArg, qualityArg, ...pairs] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
for (const pair of pairs) {
  const [src, dest] = pair.split('=');
  const url = `data:image/png;base64,${fs.readFileSync(src).toString('base64')}`;
  const jpeg = await page.evaluate(async ({ url, max, quality }) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const probe = document.createElement('canvas');
    probe.width = img.width;
    probe.height = img.height;
    const pctx = probe.getContext('2d', { willReadFrequently: true });
    pctx.drawImage(img, 0, 0);
    const { data } = pctx.getImageData(0, 0, img.width, img.height);
    let x0 = img.width, y0 = img.height, x1 = -1, y1 = -1;
    for (let y = 0; y < img.height; y += 1) {
      for (let x = 0; x < img.width; x += 1) {
        const i = (y * img.width + x) * 4;
        if (data[i + 3] > 20 && (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235)) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) { x0 = 0; y0 = 0; x1 = img.width - 1; y1 = img.height - 1; }
    const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(img.width - 1, x1 + pad); y1 = Math.min(img.height - 1, y1 + pad);
    const sw = x1 - x0 + 1, sh = y1 - y0 + 1;
    const scale = Math.min(1, max / Math.max(sw, sh));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, x0, y0, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  }, { url, max: Number(maxArg), quality: Number(qualityArg) });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(jpeg.split(',')[1], 'base64'));
  console.log(dest, fs.statSync(dest).size);
}
await browser.close();
