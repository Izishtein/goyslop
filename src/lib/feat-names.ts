const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3 };

/** "Power Strike II" → { base: "power strike", rank: 2 }; rank 0 for a name with no numeral. */
export function splitNumeral(name: string): { base: string; rank: number } {
  const match = /^(.*\S)\s+(I|II|III)$/i.exec(name.trim());
  return match
    ? { base: match[1].toLowerCase(), rank: ROMAN[match[2].toUpperCase()] }
    : { base: name.trim().toLowerCase(), rank: 0 };
}
