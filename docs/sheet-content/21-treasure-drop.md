# Treasure Drop (§ 3 optional system)

Source: **Epic Treasury** pp. 69–75. Read from rendered page images (`scripts/render-pdf-pages.mjs`), not `pdftotext`: the Treasure Points Estimate Chart on p. 69 is a narrow two-column table, and `pdftotext -layout` shifted every row from "24–28" onward up by one — 24–28 read back as "6–8" instead of the printed "5–6". This is the same failure mode logged in `state.md`'s PDF-parsing grabli for narrow tables; rendering and reading the page directly was the only way to catch it here, so every table in this file was transcribed from the rendered image, not the text layer.

## What it is

A GM tool for a single scenario, not a player-facing system. The GM spends **Treasure Points** to give a monster combat abilities from the **Treasure Enhancement Abilities List**; defeating that monster hands the PCs the same number of points back, which they spend rolling on a **Treasure Drop Table** for loot. Points do not carry over between scenarios.

```
1. Determination of Treasure Points  (GM, from the Estimate Chart)
2. Enhance Monster with Treasure Points  (GM, from the Enhancement Abilities List)
3. Earn Treasure Points  (PCs, on defeating the monster)
4. Spend Treasure Points and use the "Treasure Drop Table"  (PCs)
```

Each Treasure Point is worth about 1,000 gamel in item value — but a GM handing out points as pure reward, without enhancing a monster, is advised to value them closer to 600–700 gamel/point and cap them at half the total reward (p. 71), since players may not want what they roll and can only sell it at half price.

## Treasure Points Estimate Chart (p. 69)

Maps "total of the PCs' Adventurer Levels" to a Treasure Points budget for the scenario — `TREASURE_POINTS_ESTIMATE` in `src/data/treasure-drop.ts`, 15 rows from "8 or less → 1" to "60–75 → 50–65".

## Treasure Enhancement Abilities List (p. 70)

8 abilities, each priced across Treasure Point costs 1–10 (not every cost is available — the book marks gaps with "-"): Increase Weakness, Increase Initiative, Instant Damage, Instant Defense, Instant Success Value, Chain Attack, Curse Wave, Global Contamination. Full costs and descriptions are in `TREASURE_ENHANCEMENT_ABILITIES`. Rules of thumb that apply across all of them: the same ability given to a monster twice does not stack (except Instant Damage, explicitly), and a multi-section monster prices most of these per section — except Increase Weakness and Increase Initiative, which buff the whole monster for one assignment.

## The 13 Treasure Drop Tables (pp. 71–75)

13 tables, keyed to a Treasure Point cost: A1/A2 (1 pt), B (2), C (3), D (4), E (6), F (8), G (10), H (12), I (16), J (20), K (25), L (40). Rolling proceeds 1d at a time: Table A is picked first between A1 (1–3) and A2 (4–6), then every table of A1–F is a further two 1d rolls (a "sub-table" 1–6, then a row 1–6, 36 items total); tables G–L collapse the sub-table roll to a single 1d split into halves (1–3 / 4–6, then a row 1–6, 12 items total).

**Item entries are index only** — name and Category/Classification, exactly as the tables print them, matching the same call made for spells, Techniques, Evocations and Work Skills: the book does not give these items mechanical stats in this section at all (a separate, much larger "Item Lists"/"Items Detailed Data" section of Epic Treasury does that, out of scope here and not part of the Treasure Drop system specifically). 324 items total (7 tables × 36 + 6 tables × 12), all in `TREASURE_DROP_TABLES` in `src/data/treasure-drop.ts`, grouped exactly as the book lays them out so the reference tab can be rolled against by hand at the table.

Footnoted items (asterisks) keep the book's own footnote text attached to the table, e.g. "Card colors are determined at random," "PCs choose whether to get arrows or quarrels."

## What's on the sheet vs. what isn't

Nothing is added to `CharacterSchema`. A Treasure Drop item a player actually receives is typed into the sheet's existing free-text Inventory row, the same as anything bought at a shop — there is no "Treasure Drop" state that belongs to a character. The whole system surfaces as a **GM reference tab** only (Reference screen → "Treasure Drop"): the Estimate Chart, the Enhancement Abilities List, and all 13 loot tables, browsable while prepping or running a scenario. No dice-rolling UI is implemented, matching the same choice already made for the Work Skills d66 randomizer and the Abyss Curse table — the reference prints the roll columns for hand-rolling, not an in-app roller.
