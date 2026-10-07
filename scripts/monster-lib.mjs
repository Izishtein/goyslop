// Parsing helpers shared by scripts/parse-monsters.mjs and scripts/parse-golems.mjs: the label
// line ("Rep/Weak: 8/12 …"), a "3 (10)" value pair, the section table and the unique-skill list.
export const LABELS = [
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

export const id = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function splitLabels(text) {
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
export function pair(text) {
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
export function parseRows(text) {
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
export function parseSkills(lines) {
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

