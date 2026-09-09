# Advanced Combat (§ 3 optional system)

Source: **Epic Treasury** pp. 78-91, read with `pdftotext -layout` (no narrow/dense tables here,
unlike Treasure Drop or Vagrant — the text layer came out clean, no page rendering needed).

## What it is

A GM-facing ruleset for running combat on an actual 2D battlefield (paper, whiteboard, or a
virtual tabletop) instead of the abstract "melee / independent" bookkeeping of Simplified and
Standard Combat (CR I p. 118, CR II p. 48). Characters get real coordinates in meters; movement,
range, area effects, and line-of-sight all become spatial. Everything else — what a Major/Minor
Action can do, Accuracy/Evasion, HP/MP, spell effects — is unchanged from the normal rules; this
section only redefines *positioning*.

This is, by a wide margin, the smallest of the six § 3 systems for what it gives the character
**sheet**: no new classes, feats, spells, items, or ability corrections anywhere in it — the
roadmap's own note ("gives the least to the character sheet") holds up on a full read. It is
almost entirely GM procedure and geometry: how a "skirmish" circle forms and expands, how
movement can be blocked, how area-of-effect spells interact with two dimensions, how melee vs.
independent characters are tracked. None of that reduces to player-facing catalog data — it's
run at the table by the GM narrating positions, not something a character sheet holds.

## What's actually tabular (everything else is procedure, not data)

Four small reference tables exist in the whole 14-page section — all of it copied here in full,
nothing abbreviated for space:

### Combat Opening Recommended Distances Guide (p. 79)

Same table as Standard Combat; the GM picks the starting distance between Factions from this,
constrained further by the size of the actual battlefield.

| Situation | Distance |
|---|---|
| Enclosed space | 5m |
| Relatively large space | 10m |
| Crowded space, such as a forest | 10m |
| Open space, such as flat plains | 20m |
| Moving, such as on horseback | +10-20m |
| Fighting a large monster | +5-10m |

### Type of Movement and Distance to Travel (p. 80)

| Movement type | Distance to travel |
|---|---|
| Full Move | Movement x 3m |
| Normal Move | Movement m |
| Limited Move | 3m (if Movement is less than 3m, then Movement m) |

### Skirmish Range Table (p. 81)

The radius (outdoors) or grid size (indoors) of the circle a melee/skirmish occupies, by number
of participating characters (sections) — used repeatedly through the rest of the section whenever
a skirmish forms, expands, or merges.

| Participants | Outdoor radius | Indoor size |
|---|---|---|
| 2-5 | 3m | 5x5 |
| 6-10 | 4m | 7x7 |
| 11-15 | 5m | 8x8 |
| 16-20 | 6m | 10x10 |

### Bonuses and Penalties for Surprises (p. 89)

Modifiers for the Hide-check-vs-Danger-Sense surprise-attack roll (CR I pp. 104, 106), specific
to Advanced Combat's meters-based distances. The distance-band rows apply to the Danger Sense
side (the closest enemy's distance sets the bonus); the movement-type rows apply to whichever
side is doing the checking, as printed.

| Condition | Modification |
|---|---|
| Within 10m | Danger Sense +4 |
| 11-20m | Danger Sense +2 |
| 21-30m | No changes |
| More than 31m | Danger Sense -2 |
| Wide field of view | Hide check -2 |
| Poor footing, easy to make noise | Hide check -2 |
| Full Move | Check done by moving Faction -4 (whichever check it is) |
| Normal Move | No changes |
| Limited Move / No Move | Check done by moving Faction +2 |

## What's deliberately not transcribed

- **The "Accounts as a Blocker in a Skirmish" O/X grid** (p. 85) — a 2x4 boolean table for one
  specific rule interaction (whether a moving character can be blocked, cross-referenced against
  melee/independent state for both the mover and the blocker). It only makes sense read next to
  the paragraph of rules text explaining the O/X notation and the 2:1 Faction-size exception —
  copying the grid alone without that context would be actively misleading, unlike the four
  tables above which are genuinely self-contained lookups.
- **The Combat Procedure Chart** (p. 79) — a 4-step checklist ("1.1 Confirmation of Factions" ...
  "1.4 Initiative Check") identical to Simplified Combat's own procedure, already established
  play sequence, not new data.
- All the surrounding rules prose (skirmish formation/merging/contraction, movement blocking,
  shielding and line-of-sight, wide-area/Line/Breakthrough effects in two dimensions, overcrowded
  skirmishes) — this is GM procedure to run at the table, not index data a catalog format would
  help with. Matches the same judgment call already made for Vagrant's pure-narrative tables
  (Environment, Happening) and Treasure Drop's Enhancement Abilities descriptions: mechanical
  numbers get a catalog, procedural rules text does not.

## What's on the sheet vs. what isn't

Nothing added to `CharacterSchema` — there is nothing here that describes a character, only how
the GM manages a battlefield. Implemented as a fourth GM-facing reference tab alongside Treasure
Drop and Vagrant's tables: the four tables above, browsable while running a session, no
interactive grid/roller (matching the same choice already made for Work Skills' d66 randomizer,
Treasure Drop's loot tables, and Vagrant's experience tables — this project doesn't build
dice-rolling or map UI, only prints the reference numbers for hand use at the table).

This closes the last of the six § 3 optional systems from `docs/roadmap.md`
(Fellow → Work Skills → Point Buy → Treasure Drop → Vagrant → **Advanced Combat**).
