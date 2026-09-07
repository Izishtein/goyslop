import { ARCANE, makeSpell, type SpellDefinition } from './types';

/** Short enough for the reference table's Book column; the provenance is in the note below. */
const SOURCE = 'Tyrants Crypts (fan wiki)';

/**
 * Arcane Magic — the Bibliomancer's school. Tyrants Crypts is under a translation embargo
 * (our preview stops at p. 19, right before the spell list), so this is transcribed from
 * the fan wiki instead — see docs/sheet-content/17-arcane-magic.md for how much that can be
 * trusted (short version: the wiki documents the SW 2.0 predecessor class, and the slot
 * table/rank thresholds match our 2.5 preview exactly, but the spell list itself is
 * unconfirmed against the 2.5 book).
 *
 * The book groups these into five ranks, not circles, unlocked at Bibliomancer 1/4/7/10/13
 * rather than one rank per level. `circle` carries that required level instead of a rank
 * number 1-5, so the existing "above class level" gating (circle vs. class level, shared by
 * every other school) works unmodified. It reads as "circle 4" on the sheet rather than
 * "rank 2" — a labeling wrinkle, not a data error.
 */
const RANK_LEVEL = { 1: 1, 2: 4, 3: 7, 4: 10, 5: 13 } as const;

const spell = (rank: keyof typeof RANK_LEVEL, name: string, mp: number) =>
  makeSpell(SOURCE, ARCANE, RANK_LEVEL[rank], name, mp);

export const ARCANE_SPELLS: SpellDefinition[] = [
  // --- Rank 1 (Bibliomancer 1) ---
  spell(1, 'Acus Malitiae', 3),
  spell(1, 'Corpus Reparare', 5),
  spell(1, 'Lancare Ruinas', 6),
  spell(1, 'Nebra Venedamus', 8),
  spell(1, 'Spatium Oculus', 6),
  spell(1, 'Welm Rejectus', 6),

  // --- Rank 2 (Bibliomancer 4) ---
  spell(2, 'Adicio Elementum', 5),
  spell(2, 'Aktio Exokisumus', 6),
  spell(2, 'Magica Auguetas', 6),
  spell(2, 'Lux Trikience', 9),
  spell(2, 'Parare Absconditus', 7),
  spell(2, 'Pulkeritoud', 4),

  // --- Rank 3 (Bibliomancer 7) ---
  spell(3, 'Momento Reparare', 7),
  spell(3, 'Atmos Iraptio', 12),
  spell(3, 'Lancair Damnatorius', 7),
  spell(3, 'Magna Perceptio', 14),
  spell(3, 'Magna Saltous', 5),
  spell(3, 'Renato Inceptum', 10),

  // --- Rank 4 (Bibliomancer 10) ---
  spell(4, 'Conglare Rapidus', 18),
  spell(4, 'Defensio Perfectus', 20),
  spell(4, 'Denebras Cayence Luminous', 14),
  spell(4, 'Kerelitas Walatous', 20),
  spell(4, 'Mors Excessus', 20),

  // --- Rank 5 (Bibliomancer 13) ---
  spell(5, 'Ensis Variabilis', 1),
  spell(5, 'Lancare Ferriodeus', 18),
  spell(5, 'Lux Sanctum Adventus', 30),
  spell(5, 'Mors Tempestus', 30),
  spell(5, 'Spatium Teleportus', 25),
];
