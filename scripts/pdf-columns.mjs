// Reads a book page as text, one column at a time, from the positions pdf.js reports for
// every text run. `pdftotext -layout` interleaves the two columns of the monster pages line
// by line; splitting by x first and reading each column top to bottom keeps a monster card
// in one piece. Needs `npm install --no-save pdfjs-dist` (kept out of package.json on purpose).
//
// Usage: node scripts/pdf-columns.mjs "<pdf>" <first> <last> [splitX]
// As a module: `readColumns(doc, pageNumber, splitX?)` → { left, right }, each a list of
// { text, x, indent } lines; `indent` marks the first line of a paragraph.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function openPdf(pdfPath) {
  return getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), useSystemFonts: true, verbosity: 0 }).promise;
}

/** Join the runs of one baseline, adding a space only where the gap between runs is a real one. */
function joinRow(row) {
  const sorted = row.sort((a, b) => a.x - b.x);
  let out = '';
  let end = null;
  for (const item of sorted) {
    if (end !== null && item.x - end > 1.2 && !out.endsWith(' ') && !item.text.startsWith(' ')) out += ' ';
    out += item.text;
    end = item.x + item.width;
  }
  return { text: out.split(/\s+/).join(' ').trim(), x: sorted[0].x };
}

function toLines(items) {
  const sorted = [...items].sort((a, b) => b.y - a.y);
  const rows = [];
  for (const item of sorted) {
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= 3);
    if (row) row.items.push(item);
    else rows.push({ y: item.y, items: [item] });
  }
  const lines = rows
    .sort((a, b) => b.y - a.y)
    .map((row) => joinRow(row.items))
    .filter((line) => line.text);
  // A paragraph starts with a first-line indent; the column's own left edge is the smallest x
  // of a line long enough to be running text rather than a centred heading.
  const body = lines.filter((line) => line.text.length > 30).map((line) => line.x);
  const edge = body.length ? Math.min(...body) : 0;
  return lines.map((line) => ({ ...line, indent: line.x - edge > 2 }));
}

export async function readColumns(doc, pageNumber, splitX) {
  const page = await doc.getPage(pageNumber);
  const { width } = page.getViewport({ scale: 1 });
  const split = splitX ?? width / 2;
  const content = await page.getTextContent();
  const items = content.items
    .filter((item) => item.str !== '' && item.str.trim() !== '')
    .map((item) => ({ x: item.transform[4], y: item.transform[5], width: item.width, text: item.str }));
  return { left: toLines(items.filter((item) => item.x < split)), right: toLines(items.filter((item) => item.x >= split)) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [pdfPath, first, last, splitArg] = process.argv.slice(2);
  const doc = await openPdf(pdfPath);
  for (let n = Number(first); n <= Number(last); n++) {
    const { left, right } = await readColumns(doc, n, splitArg ? Number(splitArg) : undefined);
    const text = (lines) => lines.map((line) => (line.indent ? '  ' : '') + line.text).join('\n');
    console.log(`=== PAGE ${n} ===\n--- LEFT ---\n${text(left)}\n--- RIGHT ---\n${text(right)}`);
  }
}
