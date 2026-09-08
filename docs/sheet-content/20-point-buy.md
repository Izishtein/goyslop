# Point Buy Character Creation (§ 3 optional system)

Source: **Epic Treasury** p. 64 — a single page, the whole rule.

## What it is

An alternative to rolling the racial A-F correction dice at character creation. "Use this
method if you do not want to use dice for advantage or disadvantage, or if you want to
prioritize fairness in conventions or online sessions where players bring their own
characters beforehand."

The correction a player ends up with is **exactly the same number a die roll would have
given** — 1-6 for a 1d ability, 2-12 for 2d, plus the racial flat bonus the same way a rolled
die's bonus is added (`correctionRange` in `lib/formulas/ability-base.ts` already computes
this span). Point Buy does not change that number's meaning or its range. What it adds is a
**point cost** for choosing a value instead of rolling it — a table converts each possible
roll into a cost, and "the sum total of these points must be 0 or less" across all six A-F
corrections. Cheap (negative-cost) picks pay for expensive (positive-cost) ones; picking the
maximum everywhere is not affordable.

### A-F Determination Table (1d), p. 64

| Roll | Cost |
|---|---|
| 1 | -15 |
| 2 | -10 |
| 3 | -5 |
| 4 | 5 |
| 5 | 10 |
| 6 | 20 |

### A-F Determination Table (2d), p. 64

| Roll | Cost |
|---|---|
| 2 | -25 |
| 3 | -20 |
| 4 | -15 |
| 5 | -10 |
| 6 | -5 |
| 7 | 0 |
| 8 | 5 |
| 9 | 10 |
| 10 | 20 |
| 11 | 40 |
| 12 | 70 |

Which table applies to which ability is exactly the racial dice split already in
`data/races.ts` (a Tabbit, the book's own example, uses 1d for three abilities and 2d for
the other three — matching `abilityDice` per ability, not per race as a whole).

### Adventurer 2d Table — Human's own-rolled Skill/Body/Mind, p. 64

A Human background whose `stats` is `null` (Normal, Adventurer) rolls its own Skill/Body/Mind
split with 2d instead of reading a fixed row. Point Buy gives that its own table and its own
"0 or less" budget, explicitly **not combined** with the A-F budget ("the point total for
Starting Abilities does not carry over... but must be calculated ... separately").

| Roll | Cost |
|---|---|
| 2 | -100 |
| 3 | -80 |
| 4 | -60 |
| 5 | -40 |
| 6 | -20 |
| 7 | 0 |
| 8 | 20 |
| 9 | 40 |
| 10 | 70 |
| 11 | 110 |
| 12 | 160 |

## What's on the sheet vs. what isn't

This is a creation-time bookkeeping aid, not a persisted fact about a character: the
resulting Base/Correction numbers are indistinguishable from ones a player rolled by hand,
so nothing about "this character was Point Buy'd" needs to live in `CharacterSchema` — a
character made this way loads, saves and exports exactly like any other.

`lib/formulas/point-buy.ts` holds the two lookup tables as pure functions
(`abilityPointCost`, `startingAbilityPointCost`). `CharacterCreationForm.tsx` gets an
opt-in "Point Buy" checkbox: when on, each Correction field shows its point cost next to it,
and a running total is shown per budget (A-F; Skill/Body/Mind when the background rolls its
own), flagged over budget the same advisory way an out-of-dice-range Correction already is
(`badCorrections`) — a warning, not a blocked submit, since house rules and GM fiat are
always in play.
