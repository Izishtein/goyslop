// Pulls the pictures embedded in pages of a rulebook PDF out as they are stored (no page text over them).
// Needs the same two throwaway packages as render-pdf-pages.mjs: npm install --no-save playwright pdfjs-dist
// Usage: node scripts/extract-pdf-images.mjs "<pdf path under the repo root>" <first> <last> <outDir> [minPx]
// Writes <outDir>/p<page>-<n>-<w>x<h>-x<left>.png for every picture at least minPx (default 200) on both sides, in the order
// the page draws them; the -x part is the picture's left edge on the page in points, which tells left from right.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [pdfPath, first, last, outDir, minArg] = process.argv.slice(2);
const minPx = Number(minArg ?? 200);
fs.mkdirSync(outDir, { recursive: true });
const root = process.cwd();
const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.pdf': 'application/pdf', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<canvas id="c"></canvas>'); return; }
  const file = path.join(root, urlPath);
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.error('page error:', m.text()); });
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.evaluate(async ({ base, pdfUrl }) => {
  const pdfjs = await import(`${base}/node_modules/pdfjs-dist/build/pdf.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `${base}/node_modules/pdfjs-dist/build/pdf.worker.mjs`;
  window.__pdfjs = pdfjs;
  window.__doc = await pdfjs.getDocument({ url: pdfUrl }).promise;
}, { base, pdfUrl: `${base}/${pdfPath.split(path.sep).join('/')}` });

for (let n = Number(first); n <= Number(last); n += 1) {
  const items = await page.evaluate(async ({ n, minPx }) => {
    const { OPS } = window.__pdfjs;
    const pdfPage = await window.__doc.getPage(n);
    const ops = await pdfPage.getOperatorList();
    const mul = (m, k) => [m[0]*k[0]+m[2]*k[1], m[1]*k[0]+m[3]*k[1], m[0]*k[2]+m[2]*k[3], m[1]*k[2]+m[3]*k[3], m[0]*k[4]+m[2]*k[5]+m[4], m[1]*k[4]+m[3]*k[5]+m[5]];
    let ctm = [1, 0, 0, 1, 0, 0];
    const stack = [];
    const out = [];
    for (let i = 0; i < ops.fnArray.length; i += 1) {
      const f = ops.fnArray[i], a = ops.argsArray[i];
      if (f === OPS.save) stack.push(ctm);
      else if (f === OPS.restore) ctm = stack.pop() ?? ctm;
      else if (f === OPS.transform) ctm = mul(ctm, a);
      else if (f === OPS.paintImageXObject) {
        const id = a[0];
        const obj = await new Promise((resolve) => { const t = setTimeout(() => resolve(null), 4000); pdfPage.objs.get(id, (o) => { clearTimeout(t); resolve(o); }); });
        if (!obj || obj.width < minPx || obj.height < minPx) continue;
        const canvas = document.getElementById('c');
        canvas.width = obj.width;
        canvas.height = obj.height;
        const ctx = canvas.getContext('2d');
        if (obj.bitmap) ctx.drawImage(obj.bitmap, 0, 0);
        else if (obj.data) {
          const rgba = new Uint8ClampedArray(obj.width * obj.height * 4);
          const d = obj.data, px = obj.width * obj.height;
          if (d.length === px * 4) rgba.set(d);
          else if (d.length === px * 3) for (let k = 0; k < px; k += 1) { rgba[k*4] = d[k*3]; rgba[k*4+1] = d[k*3+1]; rgba[k*4+2] = d[k*3+2]; rgba[k*4+3] = 255; }
          else if (d.length === px) for (let k = 0; k < px; k += 1) { rgba[k*4] = rgba[k*4+1] = rgba[k*4+2] = d[k]; rgba[k*4+3] = 255; }
          else continue;
          ctx.putImageData(new ImageData(rgba, obj.width, obj.height), 0, 0);
        } else continue;
        out.push({ w: obj.width, h: obj.height, left: Math.round(ctm[4]), url: canvas.toDataURL('image/png') });
      }
    }
    return out;
  }, { n, minPx });
  items.forEach((item, index) => {
    const file = path.join(outDir, `p${String(n).padStart(3, '0')}-${index + 1}-${item.w}x${item.h}-x${item.left}.png`);
    fs.writeFileSync(file, Buffer.from(item.url.split(',')[1], 'base64'));
    console.log('wrote', file);
  });
}
await browser.close();
server.close();
