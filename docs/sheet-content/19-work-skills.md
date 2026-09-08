# Work Skills (§ 3 optional system)

Sources: **Epic Treasury** pp. 65–68 (base rules) and **Raxia Life** Part 2 "Expansion of
Work Skills", pp. 47–108 (the 81-skill catalog and its extended checks/bonuses). Raxia Life
pp. 3–7 confirm it builds directly on the Epic Treasury rules ("The work skill rules covered
in this book aim to expand and delve deeper into them").

## What it is

Work Skills are non-adventuring professions (Blacksmith, Merchant, Cleric-as-a-day-job,
Sailor, …) — separate from adventurer classes, levels 1–15, used for checks the same way a
class is: `skill level + ability modifier` as Standard Value, 2d rolled against a Target
Number. They exist for roleplay and background, not combat: "no work skill provides a
significant advantage in combat" (Raxia Life p. 49).

Rules that matter for the sheet:
- **Levels 1–15**, but a starting PC is capped at **level 5 per skill, 10 levels total**
  across all skills (Epic Treasury p. 65, restated Raxia Life p. 48). This is a soft
  guideline, not a hard rule the book itself enforces beyond character creation — mid-game
  acquisition follows the same cap, growth past it costs "Work XP" earned between sessions.
  A level, once taken, is never lost.
- **Work Skills Level 1 and 5 Reference Chart** (Epic Treasury p. 65 / Raxia Life p. 48) —
  level 1 is "about a month's experience", level 5 is "professional, several years of
  experience". Levels 6+ go further (Raxia Life p. 50): 7 = independent craftsman, 10 =
  master, 15 = "referred to as a god in their profession".
- **Income/XP between sessions** (Raxia Life p. 49) — an optional table-driven mini-game
  (roll 2d, get gold or "Work XP", spend Work XP equal to the target level to grow past the
  starting cap). Not implemented on the sheet: it is a between-session GM ritual with its own
  dice tables, not a number the character sheet tracks or calculates.

## What's on the sheet vs. what isn't

Same call as the spell and Techniques/Spellsongs catalogs: **index only, no effect text**.
Each of the 81 skills in Raxia Life gets a full page or more — description, "Additional
Information", a list of named checks with Time Required and a paragraph each, and a
level-based bonus table (5/10/15). Transcribing all of that would be a multi-book effort on
its own and duplicates material the roadmap explicitly scoped as "чисто справочный контент,
расчётов нет" (purely reference content, no calculations feeding the sheet's numbers).

The catalog (`src/data/work-skills.ts`) carries: **name, associated profession, category,
Raxia Life page**. The sheet section stores **name (catalog pick or free text) + level (1–15)
+ notes**, exactly the KnownSpell/KnownArt pattern — the row's own note field is where a
player writes what a check does, if they want that written down at all.

## The 81-skill catalog

Raxia Life p. 51, "Work Skill List & Random Decision Table" — a d66 grid (also usable to roll
a random skill, which the sheet does not implement). Verified against the PDF text layer
twice: once with `pdftotext -layout` and once with plain `pdftotext -f 51 -l 51` (no layout),
which reads each 9-line table cell as a contiguous block and does not depend on the
multi-column layout heuristic. Both extractions agree cell for cell.

The book itself sorts the 81 into six categories (p. 51), each mapped here to a page range
from the table of contents:

| Category | Book pages | Count |
|---|---|---|
| Towns and Villages | 53–68 | 23 |
| Craftsmen and Workshops | 69–78 | 14 |
| Knowledge, Research, and Arts | 79–93 | 23 |
| Castles, Temples, Courts, and Military | 94–99 | 8 |
| Suburbs (Countryside, Mountains, and Highways) | 100–105 | 9 |
| Suburbs (Rivers and Seas) | 106–108 | 4 |

23 + 14 + 23 + 8 + 9 + 4 = 81, matching the book's own count ("There are as many as 81
types", Raxia Life p. 4). Every skill's page number in the catalog is the one printed in the
d66 table, which is also where its full write-up starts.

## Epic Treasury's own list

Epic Treasury pp. 66–68 print a separate, shorter "Work Skills List" — ~72 profession/skill
examples with a one-line description each, explicitly "by no means an exhaustive list". It
predates and is superseded by Raxia Life's 81-skill catalog for anyone who owns both books
(which this project's `files/` does); not transcribed separately since Raxia Life's list is
the more complete, categorized, page-referenced version of the same thing.

## Not implemented (out of scope for this pass)

- The d66 random-roll mechanic itself — the catalog has the data, but rolling isn't wired to
  a UI control. Same treatment as the Abyss Curse table (§ items reference tab), which prints
  the roll column for hand-rolling but does not roll it in-app.
- The Income/Experience Points Earning Tables and the "grow past the cap with Work XP"
  bookkeeping — a between-session GM ritual, not a sheet number.
- Full check lists, Time Required, and level-based bonus text for each of the 81 skills — see
  "What's on the sheet vs. what isn't" above.
