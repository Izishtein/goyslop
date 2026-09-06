// Renders pages of the rulebook PDFs in files/ to PNG, so the parts of a page that are
// drawn rather than typeset can be read. This matters for the spell tables: pdftotext gets
// every name, cost and effect, but a spell's LEVEL is a graphic — a band reading "3rd Level
// Nature Spells" over the column, plus a numbered badge — so the text layer never has it.
//
// Needs two packages deliberately kept out of package.json. Install them in one command:
// npm prunes anything missing from the manifest on the next install, so installing them
// one at a time removes the other.
//   npm install --no-save playwright pdfjs-dist
// Chromium comes from the installed Edge (channel: 'msedge'), so no browser download.
//
// Usage: node scripts/render-pdf-pages.mjs "<pdf path>" <first> <last> <outDir> [scale]
// Page numbers are the printed book pages; in every book checked so far those match the
// PDF page index exactly. Run it from the repository root — the helper serves the repo
// over http so pdf.js can fetch the book and its worker.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [pdfPath, first, last, outDir, scaleArg] = process.argv.slice(2);
const scale = Number(scaleArg ?? 2);
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
await page.goto(base + "/", { waitUntil: "domcontentloaded" });

await page.evaluate(async ({ base, pdfUrl }) => {
  const pdfjs = await import(`${base}/node_modules/pdfjs-dist/build/pdf.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `${base}/node_modules/pdfjs-dist/build/pdf.worker.mjs`;
  window.__doc = await pdfjs.getDocument({ url: pdfUrl }).promise;
}, { base, pdfUrl: `${base}/${pdfPath.split(path.sep).join('/')}` });

for (let n = Number(first); n <= Number(last); n += 1) {
  const dataUrl = await page.evaluate(async ({ n, scale }) => {
    const pdfPage = await window.__doc.getPage(n);
    const viewport = pdfPage.getViewport({ scale });
    const canvas = document.getElementById('c');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    return canvas.toDataURL('image/png');
  }, { n, scale });
  const out = path.join(outDir, `p${String(n).padStart(3, '0')}.png`);
  fs.writeFileSync(out, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', out);
}

await browser.close();
server.close();
