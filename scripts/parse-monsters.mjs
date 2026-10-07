// Turns Monstrous Lore "Monster Data" (pp. 73-224) into src/data/monsters/monsters.json.
//
// Run from the repository root (needs `npm install --no-save pdfjs-dist`):
//   node scripts/parse-monsters.mjs [out.json]
// Prints every card it could not read cleanly, so a parse problem is a visible list rather
// than a quiet gap in the catalogue.
import fs from 'node:fs';
import { openPdf, readColumns } from './pdf-columns.mjs';

const PDF = 'files/Sword World 2.5 - Monstrous Lore.pdf';
const FIRST_PAGE = 73;
const LAST_PAGE = 224;
const OUT = process.argv[2] ?? 'src/data/monsters/monsters.json';

// First printed page of each classification (the contents page); the heading itself is an image.
const CATEGORY_STARTS = [
  [73, 'Barbarous'],
  [107, 'Animals'],
  [126, 'Plants'],
  [134, 'Undead'],
  [149, 'Constructs'],
  [159, 'Magitech'],
  [175, 'Mythical Beasts'],
  [187, 'Fairies'],
  [201, 'Daemons'],
  [218, 'Humanoids'],
];
const categoryOf = (page) => CATEGORY_STARTS.filter(([start]) => start <= page).at(-1)[1];
const SOURCE = String.raw`(?:CR I{1,3} p\. \d+|[A-Z]{2,4}(?: p\. \d+)?|New)`;
const HEADER = new RegExp(String.raw`^(\d+\+?)\s+(.+?)\s+(${SOURCE})$`);
const LABELS = [
  'Intelligence',
  'Perception',
  'Disposition',
  'Soulscars',
  'Souls.',
  'Language',
  'Habitat',
  'Rep/Weak',
  'Weak Points',
  'Weak Point',
  'W. P.',
  'W.P.',
  'Initiative',
  'Movement Speed',
  'Fortitude',
  'Willpower',
];

const doc = await openPdf(PDF);

// ---- 1. one stream of lines, left column then right column, page after page ----
const stream = [];
for (let page = FIRST_PAGE; page <= LAST_PAGE; page++) {
  const { left, right } = await readColumns(doc, page);
  for (const column of [left, right]) {
    for (const line of column) {
      if (line.text === String(page) || line.text === 'Part 2 Monsters') continue;
      stream.push({ ...line, page });
    }
  }
}

// ---- 2. cut the stream into cards at each header line (the line above "Intelligence:") ----
const cards = [];
let current = null;
for (let i = 0; i < stream.length; i++) {
  const line = stream[i];
  const isHeader = HEADER.test(line.text) && stream[i + 1]?.text.startsWith('Intelligence:');
  if (isHeader) {
    current = { header: line.text, category: categoryOf(line.page), page: line.page, lines: [] };
    cards.push(current);
    continue;
  }
  current?.lines.push(line);
}

// ---- 3. parse each card ----
const problems = [];
const id = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function splitLabels(text) {
  const found = [];
  for (const label of LABELS) {
    const match = new RegExp(String.raw`(?:^|\s)${label.replace(/[.]/g, '\\.')}:`).exec(text);
    if (match) found.push({ label, at: match.index + (match[0].startsWith(' ') ? 1 : 0), end: match.index + match[0].length });
  }
  found.sort((a, b) => a.at - b.at);
  const values = {};
  found.forEach((entry, index) => {
    values[entry.label] = text.slice(entry.end, found[index + 1]?.at ?? text.length).trim();
  });
  return values;
}

/** "3 (10)" → { value: 3, fixed: 10 }; "-" → null; "※+2" and similar template marks stay text. */
function pair(text) {
  const match = /^(-?\d+)\s*\(\s*(-?\d+)\s*\)$/.exec(text.trim());
  if (match) return { value: Number(match[1]), fixed: Number(match[2]) };
  if (/^-?\d+$/.test(text.trim())) return { value: Number(text), fixed: null };
  return text.trim() === '-' ? null : { raw: text.trim() };
}


const COLUMN = String.raw`(-|※\S*|\d+(?:\(\d+\))?)\s+(-|2d(?:[+-]\d+)?|※\S*)\s+(-|※\S*|\d+(?:\(\d+\))?)\s+(-|※?[+-]?\d+|※)\s+(-|※?[+-]?\d+|※)\s+(-|※?[+-]?\d+|※)`;

/**
 * All the section rows of one card, read from its table as a single text. A long style name
 * wraps around its numbers ("Weapon (Upper <numbers> Body)"), so the numbers are found first
 * and the words between two number groups are shared out by parentheses: whatever closes an
 * opened bracket belongs to the row before, the rest to the row after.
 */
function parseRows(text) {
  const flat = text.replace(/\s*\(\s*(\d+)\s*\)/g, '($1)').replace(/\s+/g, ' ').trim();
  const tails = [...flat.matchAll(new RegExp(COLUMN, 'g'))];
  const rows = [];
  let cursor = 0;
  let carry = '';
  tails.forEach((tail, index) => {
    const before = index === 0 ? flat.slice(0, tail.index).trim() : carry;
    cursor = tail.index + tail[0].length;
    const next = flat.slice(cursor, tails[index + 1]?.index ?? flat.length);
    // Words after the numbers that finish an open bracket (or are a bracket of their own) are this row's.
    let suffix = '';
    let rest = next;
    const opens = (before.match(/\(/g) ?? []).length - (before.match(/\)/g) ?? []).length;
    const close = opens > 0 ? next.indexOf(')') : next.trimStart().startsWith('(') ? next.indexOf(')') : -1;
    if (close >= 0) {
      suffix = next.slice(0, close + 1).trim();
      rest = next.slice(close + 1);
    }
    carry = rest.trim();
    const [, accuracy, damage, evasion, defense, hp, mp] = tail;
    const num = (value) => (value === '-' ? null : /^-?\d+$/.test(value) ? Number(value) : value);
    rows.push({
      style: (before + ' ' + suffix).trim() || '※',
      accuracy: pair(accuracy.replace('(', ' (')),
      damage: damage === '-' ? null : damage,
      evasion: pair(evasion.replace('(', ' (')),
      defense: num(defense),
      hp: num(hp),
      mp: num(mp),
    });
    // the carried words only belong to the next row when there is one
    if (index === tails.length - 1) carry = '';
  });
  return rows;
}

/**
 * Unique skills. A line opening with an action symbol (◯ passive, ► major action, 🗨 declaration,
 * ⏩ minor action, △ …) names a skill and the lines under it describe it; "●" names the body
 * section the following skills belong to (multi-section monsters). "None." means no skills.
 */
function parseSkills(lines) {
  const skills = [];
  let section = '';
  for (const text of lines) {
    if (text.startsWith('●')) {
      section = text.slice(1).trim();
      continue;
    }
    const heading = /^((?:[◯►🗨⏩△]\s*)+)(.*)$/u.exec(text);
    if (heading) {
      skills.push({ ...(section ? { section } : {}), icons: heading[1].replace(/\s+/g, ''), name: heading[2].trim(), text: [] });
    } else if (text === 'None.') {
      continue;
    } else if (skills.length === 0 || (skills.at(-1).section ?? '') !== section) {
      skills.push({ ...(section ? { section } : {}), icons: '', name: '', text: [text] });
    } else {
      skills.at(-1).text.push(text);
    }
  }
  return skills;
}

// Cards whose table the PDF text layer scrambles (verified against the rendered page).
const ROW_OVERRIDES = {
  domsva: [
    { style: 'Weapon (Upper Body)', accuracy: { value: 10, fixed: 17 }, damage: '2d+12', evasion: { value: 12, fixed: 19 }, defense: 9, hp: 85, mp: null },
    { style: 'None (Body)', accuracy: null, damage: null, evasion: { value: 11, fixed: 18 }, defense: 11, hp: 95, mp: null },
    { style: 'Kick (Legs)', accuracy: { value: 14, fixed: 21 }, damage: '2d+15', evasion: { value: 12, fixed: 19 }, defense: 9, hp: 85, mp: null },
  ],
};

const monsters = [];
for (const card of cards) {
  const header = HEADER.exec(card.header);
  const level = header[1];
  const name = header[2];
  const source = header[3];
  const lines = card.lines;
  const iSkills = lines.findIndex((line) => line.text === 'Unique Skills');
  // Fairies carry no Loot, and the second form of a monster (Dragon Form, Daemon Form) shares
  // the first form's Description, so both blocks are optional.
  const lootAt = lines.findIndex((line, index) => index > iSkills && (line.text === 'Loot' || line.text.startsWith('Loot ')));
  const descAt = lines.findIndex((line, index) => index > Math.max(iSkills, lootAt) && line.text === 'Description');
  const iDesc = descAt < 0 ? lines.length : descAt;
  const iLoot = lootAt < 0 ? iDesc : lootAt;
  if (iSkills < 0) {
    problems.push(`${card.header} (p. ${card.page}): no Unique Skills`);
    continue;
  }

  const tableAt = lines.findIndex((line) => line.text.startsWith('F Style'));
  const info = lines.slice(0, tableAt < 0 ? iSkills : tableAt).map((line) => line.text).join(' ');
  const fields = splitLabels(info);
  const tableLines = lines.slice(tableAt + 1, iSkills).map((line) => line.text);
  const sectionsIndex = tableLines.findIndex((line) => line.startsWith('Sections:'));
  const rowLines = sectionsIndex < 0 ? tableLines : tableLines.slice(0, sectionsIndex);
  const sectionsLine = sectionsIndex < 0 ? '' : tableLines.slice(sectionsIndex).join(' ');

  const rows = ROW_OVERRIDES[id(name)] ?? parseRows(rowLines.join(' '));
  if (rows.length === 0) problems.push(`${card.header} (p. ${card.page}): unreadable section rows: ${JSON.stringify(rowLines)}`);

  const [fortText, willText] = [fields.Fortitude ?? '', fields.Willpower ?? ''];
  const rep = /^(\d+|-)\s*\/\s*(\d+|-)$/.exec((fields['Rep/Weak'] ?? '').replace(/\s+/g, ''));
  if (!rep && !(fields['Rep/Weak'] ?? '').includes('※')) problems.push(`${card.header} (p. ${card.page}): Rep/Weak "${fields['Rep/Weak']}"`);
  for (const key of ['Intelligence', 'Perception', 'Disposition', 'Language', 'Habitat', 'Initiative', 'Movement Speed', 'Fortitude', 'Willpower']) {
    if (!fields[key]) problems.push(`${card.header} (p. ${card.page}): no ${key}`);
  }

  // Loot rows: "2 – 3 Crude Weapon (10G/…)", "Always …", "10+ …"; a line that does not start a row continues the last one.
  const loot = [];
  const lootLines = lootAt < 0 ? [] : lines.slice(iLoot, iDesc).map((line) => line.text);
  if (lootLines.length) lootLines[0] = lootLines[0].replace(/^Loot\s*/, '');
  for (const text of lootLines.filter(Boolean)) {
    const row = /^(Always|\d+\s*[–-]\s*\d+|\d+\+)\s*(.*)$/.exec(text);
    if (row) loot.push({ roll: row[1].replace(/\s*[–-]\s*/, '–'), item: row[2].trim() });
    else if (loot.length) loot[loot.length - 1].item = `${loot[loot.length - 1].item} ${text}`.trim();
    else loot.push({ roll: '', item: text });
  }

  // Description: paragraphs start at an indented line.
  const paragraphs = [];
  for (const line of descAt < 0 ? [] : lines.slice(iDesc + 1)) {
    if (line.indent || paragraphs.length === 0) paragraphs.push(line.text);
    else paragraphs[paragraphs.length - 1] += ' ' + line.text;
  }

  // Unique skills keep their own line structure: a line opening with a symbol is a skill's heading.
  const skills = parseSkills(lines.slice(iSkills + 1, iLoot).map((line) => line.text));
  const sections = sectionsLine ? /Main Section:\s*(.+)$/.exec(sectionsLine)?.[1]?.trim() : undefined;

  monsters.push({
    id: id(name) + (monsters.some((m) => m.id === id(name)) ? `-${level}` : ''),
    name,
    level: Number.parseInt(level, 10),
    ...(level.endsWith('+') ? { levelPlus: true } : {}),
    source,
    category: card.category,
    page: card.page,
    intelligence: fields.Intelligence,
    perception: fields.Perception,
    disposition: fields.Disposition,
    soulscars: fields.Soulscars ?? fields['Souls.'] ?? undefined,
    language: fields.Language,
    habitat: fields.Habitat,
    reputation: rep ? (rep[1] === '-' ? null : Number(rep[1])) : null,
    ...(rep ? {} : { reputationNote: fields['Rep/Weak'] }),
    weakness: rep ? (rep[2] === '-' ? null : Number(rep[2])) : null,
    weakPoint: fields['Weak Point'] ?? fields['Weak Points'] ?? fields['W. P.'] ?? fields['W.P.'],
    initiative: fields.Initiative,
    movement: fields['Movement Speed'],
    fortitude: pair(fortText),
    willpower: pair(willText),
    sections: rows.filter(Boolean),
    sectionsNote: sectionsLine || undefined,
    mainSection: sections,
    skills,
    loot,
    description: paragraphs,
  });
}

fs.mkdirSync(OUT.slice(0, OUT.lastIndexOf('/')), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(monsters, null, 1));
console.log(`${cards.length} cards, ${monsters.length} monsters written to ${OUT}`);
const byCategory = {};
for (const monster of monsters) byCategory[monster.category] = (byCategory[monster.category] ?? 0) + 1;
console.log(byCategory);
console.log(problems.length ? `PROBLEMS (${problems.length}):\n` + problems.join('\n') : 'no problems');
