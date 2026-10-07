// Turns Monstrous Lore "Golem Data" (pp. 227-235) and "Familiar Data" (pp. 237-238) into
// src/data/monsters/extra-monsters.json. The cards share the general monster layout, so the
// section table and skill parsing come from monster-lib.mjs; what differs is that a golem has
// a Material line instead of Intelligence/Language/…, and a list of Enhancing Items.
//
// Run from the repository root (needs `npm install --no-save pdfjs-dist`):
//   node scripts/parse-golems.mjs [out.json]
import fs from 'node:fs';
import { id, pair, parseRows, parseSkills, splitLabels } from './monster-lib.mjs';
import { openPdf, readColumns } from './pdf-columns.mjs';

const PDF = 'files/Sword World 2.5 - Monstrous Lore.pdf';
const OUT = process.argv[2] ?? 'src/data/monsters/extra-monsters.json';

const SOURCE = String.raw`CR I{1,3},? p\. \d+`;
const GOLEM_HEADER = new RegExp(String.raw`^(\d+)\s+(.+?)\s+(${SOURCE})$`);
const FAMILIAR_HEADER = new RegExp(String.raw`^(\d+)\s+(Familiar(?: II)?: .+?)\s+(${SOURCE})(?::\s*(\d+))?$`);

// What the book prints once for the whole group (pp. 227, 236, 238) and omits from each card.
const GOLEM_COMMON = { intelligence: 'Servant', perception: 'Magic', disposition: 'Instructed', language: 'None', habitat: 'Various' };
const FAMILIAR_COMMON = {
  Familiar: { intelligence: 'None', perception: 'Shared with Caster', disposition: 'Instructed', language: 'None', habitat: 'Various', reputation: 8 },
  'Familiar II': { intelligence: 'Average', perception: 'Shared with Caster', disposition: 'Instructed', language: 'Arcana', habitat: 'Various', reputation: 12 },
};

const doc = await openPdf(PDF);
const problems = [];

async function streamOf(first, last) {
  const stream = [];
  for (let page = first; page <= last; page++) {
    const { left, right } = await readColumns(doc, page);
    for (const column of [left, right]) {
      for (const line of column) {
        if (line.text === String(page) || line.text === 'Part 2 Monsters') continue;
        stream.push({ ...line, page });
      }
    }
  }
  return stream;
}

function cut(stream, isHeader) {
  const cards = [];
  let current = null;
  stream.forEach((line, index) => {
    if (isHeader(line.text, stream[index + 1]?.text ?? '')) {
      current = { header: line.text, page: line.page, lines: [] };
      cards.push(current);
    } else current?.lines.push(line);
  });
  return cards;
}

function parseLoot(lines) {
  const loot = [];
  const texts = lines.map((line) => line.text.replace(/^Loot\s*/, '')).filter(Boolean);
  for (const text of texts) {
    const row = /^(Always|\d+\s*[–-]\s*\d+|\d+\+)\s*(.*)$/.exec(text);
    if (row) loot.push({ roll: row[1].replace(/\s*[–-]\s*/, '–'), item: row[2].trim() });
    else if (loot.length) loot[loot.length - 1].item = `${loot[loot.length - 1].item} ${text}`.trim();
    else loot.push({ roll: '', item: text });
  }
  return loot;
}

function parseDescription(lines) {
  const paragraphs = [];
  for (const line of lines) {
    if (line.indent || paragraphs.length === 0) paragraphs.push(line.text);
    else paragraphs[paragraphs.length - 1] += ' ' + line.text;
  }
  return paragraphs;
}

/** An Enhancing Item entry starts at "Name (Small) (150) …", "└Name …" or a "※Head Only" group mark; anything else continues it. */
function parseEnhancements(lines) {
  const entries = [];
  for (const { text, indent } of lines) {
    const starts = /^(※|└)/.test(text) || /^[^()]*\((?:Small|Medium|Large)\)/.test(text);
    if (starts || entries.length === 0) entries.push(text);
    else entries[entries.length - 1] += (indent || /^[►🗨⏩◯△]/u.test(text) ? '\n' : ' ') + text;
  }
  return entries;
}

function readCard(card, group) {
  const lines = card.lines;
  const iSkills = lines.findIndex((line) => line.text === 'Unique Skills');
  const tableAt = lines.findIndex((line) => line.text.startsWith('F Style'));
  if (iSkills < 0 || tableAt < 0) {
    problems.push(`${card.header} (p. ${card.page}): no table or Unique Skills`);
    return null;
  }
  const lootAt = lines.findIndex((line, index) => index > iSkills && (line.text === 'Loot' || line.text.startsWith('Loot ')));
  const descAt = lines.findIndex((line, index) => index > Math.max(iSkills, lootAt) && line.text === 'Description');
  const maxAt = lines.findIndex((line, index) => index > iSkills && line.text.startsWith('Maximum of Enhancing Items'));
  const iLoot = lootAt < 0 ? (descAt < 0 ? lines.length : descAt) : lootAt;
  const skillsEnd = maxAt >= 0 ? maxAt : iLoot;

  const infoLines = lines.slice(0, tableAt);
  const material = group === 'golem' ? infoLines[0].text : undefined;
  const fields = splitLabels(infoLines.slice(group === 'golem' ? 1 : 0).map((line) => line.text).join(' '));
  const tableLines = lines.slice(tableAt + 1, iSkills).map((line) => line.text);
  const sectionsIndex = tableLines.findIndex((line) => line.startsWith('Sections:'));
  const rowLines = sectionsIndex < 0 ? tableLines : tableLines.slice(0, sectionsIndex);
  const sectionsLine = sectionsIndex < 0 ? '' : tableLines.slice(sectionsIndex).join(' ');
  const rows = parseRows(rowLines.join(' '));
  if (rows.length === 0) problems.push(`${card.header} (p. ${card.page}): unreadable section rows`);
  return {
    material,
    fields,
    rows,
    sectionsLine,
    skills: parseSkills(lines.slice(iSkills + 1, skillsEnd).map((line) => line.text)),
    maxEnhancing: maxAt >= 0 ? Number(/=\s*(\d+)/.exec(lines[maxAt].text)?.[1]) : null,
    enhancements: maxAt >= 0 ? parseEnhancements(lines.slice(maxAt + 1, iLoot)) : [],
    loot: lootAt < 0 ? [] : parseLoot(lines.slice(iLoot, descAt < 0 ? lines.length : descAt)),
    description: descAt < 0 ? [] : parseDescription(lines.slice(descAt + 1)),
  };
}

const common = (card, data, extra) => {
  const rep = /^(\d+|-)\s*\/\s*(\d+|-)$/.exec((data.fields['Rep/Weak'] ?? '').replace(/\s+/g, ''));
  if (!rep && extra.reputation === undefined) problems.push(`${card.header} (p. ${card.page}): Rep/Weak "${data.fields['Rep/Weak']}"`);
  for (const key of ['Initiative', 'Movement Speed']) if (!data.fields[key] && !extra.fallbackInitiative) problems.push(`${card.header} (p. ${card.page}): no ${key}`);
  return rep;
};

const monsters = [];

// ---- golems ----
const golemCards = cut(await streamOf(227, 235), (text, next) => GOLEM_HEADER.test(text) && next.startsWith('Enchanted'));
for (const card of golemCards) {
  const [, level, name, source] = GOLEM_HEADER.exec(card.header);
  const data = readCard(card, 'golem');
  if (!data) continue;
  const rep = common(card, data, {});
  monsters.push({
    id: id(name),
    name,
    level: Number(level),
    source: source.replace(',', ''),
    category: 'Golems',
    page: card.page,
    ...GOLEM_COMMON,
    reputation: rep && rep[1] !== '-' ? Number(rep[1]) : null,
    weakness: rep && rep[2] !== '-' ? Number(rep[2]) : null,
    weakPoint: data.fields['Weak Point'] ?? '',
    initiative: data.fields.Initiative,
    movement: data.fields['Movement Speed'],
    fortitude: pair(data.fields.Fortitude ?? ''),
    willpower: pair(data.fields.Willpower ?? ''),
    sections: data.rows,
    sectionsNote: data.sectionsLine || undefined,
    mainSection: data.sectionsLine ? /Main Section:\s*(.+)$/.exec(data.sectionsLine)?.[1]?.trim() : undefined,
    skills: data.skills,
    loot: data.loot,
    description: data.description,
    material: data.material,
    enhancements: { max: data.maxEnhancing, entries: data.enhancements },
  });
}
// Straw Bird is printed twice (p. 227 as the sample card, p. 229 in its place): keep the later, whole one.
const golems = golemCards.length ? monsters.filter((m, index) => monsters.findLastIndex((other) => other.id === m.id) === index) : [];

// ---- familiars ----
// Page 238 opens with the common data of Familiars II, which would otherwise trail the last Familiar card.
let inCommon = false;
const familiarStream = (await streamOf(237, 238)).filter((line) => {
  if (line.text === 'Common Basic Data') inCommon = true;
  else if (FAMILIAR_HEADER.test(line.text)) inCommon = false;
  return !inCommon;
});
const familiarCards = cut(familiarStream, (text, next) => FAMILIAR_HEADER.test(text) && (next.startsWith('Initiative') || next.startsWith('Movement') || next.startsWith('F Style')));
const familiars = [];
for (const card of familiarCards) {
  const [, level, name, source, strayInitiative] = FAMILIAR_HEADER.exec(card.header);
  const kind = name.startsWith('Familiar II') ? 'Familiar II' : 'Familiar';
  const data = readCard(card, 'familiar');
  if (!data) continue;
  const base = FAMILIAR_COMMON[kind];
  // The Spider II header prints its Initiative after the page ("CR III p. 431: 16"); its info line has only Movement Speed.
  const initiative = data.fields.Initiative ?? strayInitiative;
  if (!initiative) problems.push(`${card.header} (p. ${card.page}): no Initiative`);
  familiars.push({
    id: id(name),
    name,
    level: Number(level),
    source: source.replace(',', ''),
    category: 'Familiars',
    page: card.page,
    intelligence: base.intelligence,
    perception: base.perception,
    disposition: base.disposition,
    language: base.language,
    habitat: base.habitat,
    reputation: base.reputation,
    weakness: null,
    weakPoint: 'None',
    initiative,
    movement: data.fields['Movement Speed'],
    fortitude: null,
    willpower: null,
    sections: data.rows,
    skills: data.skills,
    loot: [],
    description: [],
  });
}

const all = [...golems, ...familiars];
fs.writeFileSync(OUT, JSON.stringify(all, null, 1));
console.log(`${golems.length} golems, ${familiars.length} familiars written to ${OUT}`);
console.log(problems.length ? `PROBLEMS (${problems.length}):\n` + problems.join('\n') : 'no problems');
