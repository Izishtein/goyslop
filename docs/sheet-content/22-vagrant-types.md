# Vagrant Types (§ 3 optional character-creation system)

Source: **Outlaw Profile Book**, pp. 34–57. Category overview (which races are selectable
per Type, used below as a cross-check) is on pp. 16–17. Read from rendered page images
(`scripts/render-pdf-pages.mjs`), not `pdftotext -layout`: every "Selectable Races" table in
this range is a dense 3-column table (Race Name / Background / Skill·Body·Mind) sitting next
to a column of running prose, and `pdftotext -layout` shifts the race-name column relative to
the Background/SBM columns on nearly every page — sometimes just by one row, sometimes
dropping rows into the prose entirely. Every table below was read from the rendered PNG of
its page, not the text layer; page-by-page cross-checks against the p. 16–17 race-count prose
("Selectable races: Humans, Dwarves, ...") caught no further discrepancies except the one
flagged at the end of this file.

## What it is

Vagrant is an alternative character-creation flow for a non-adventurer PC: instead of the
normal free class pick + racial dice + Background Table roll, the player picks one of 4
**Categories**, then one of that Category's **Types**. Each Type is a fully fixed template —
Primary Class, Subclass, starting Experience Points, Additional Languages, and a **Selectable
Races** table that replaces the random Background roll: every race allowed for that Type has
a fixed Background name and a fixed Skill/Body/Mind triple, no dice involved. A "Special
Notes" line grants whatever fixed mechanical extra the Type comes with (an auto-granted
Combat Feat, Evocation, Stunt, an equipment restriction, etc.).

4 Categories, 17 Types total:

- **Warrior** (p. 34): Hunter, Alchemy Warrior, Dragoon
- **Spy** (p. 38): Commando, Tracker, Sniper
- **Remote Support** (p. 42): Wizard, Fairy Priest, Druid, Daemonologist, Alchemist, Beastmaster
- **Magic Warrior** (p. 52): Spellpuncher, Grove Defender, Summoning Warrior, Leafblade, Daemonblade

Skipped per this project's convention (index/mechanical data only): the category intro prose,
every Type's flavor/roleplay paragraphs, the "Column: Recommended for People Like This!"
sidebars, and the multi-page Fairy/Divine Magic essays on pp. 45–47.

Class names are cited both as printed and as the `id` from `src/data/classes.ts`, since every
class named in this range already exists in that catalog under those exact ids — Primary/Subclass
rank (Major/Minor) as printed matches `classes.ts`'s `rank` field in every single case below, no
mismatches there. The one real naming mismatch is the Wizard Type itself — see the note at
the end.

Each Type's printed table also tags every race with a course-availability symbol (◎ = Basic,
○ = Extended, ● = Full, per the legend on p. 16) marking the minimum course tier that unlocks
it for that Type. Not reproduced per-race below (out of scope — the fields asked for are Race /
Background / Skill·Body·Mind), but present in the book if that tier gating is ever needed.

---

## Warrior Category (p. 34)

### Hunter — Courses: Basic, Extended, Full (p. 35)

- **Primary Class:** Major Fighter 2 Level (`fighter`)
- **Subclass:** Minor Ranger 1 Level (`ranger`)
- **Remaining Experience Points:** 500
- **Additional Languages:** None
- **Special Notes:** none printed

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Warrior | 7/9/5 |
| Dwarf | Warrior | 4/11/5 |
| Nightmare | Warrior | 7/15/8 |
| Lykant | Warrior | 10/9/6 |
| Shadow | Warrior | 15/9/3 |
| Runefolk | Warrior | 9/12/5 |
| Lildraken | Warrior | 5/14/6 |
| Soleil | Warrior | 10/15/1 |
| Tiens | Warrior | 8/12/8 |
| Weakling | Warrior | 8/10/5 |

### Alchemy Warrior — Courses: Full (p. 36)

- **Primary Class:** Major Fighter 2 Level (`fighter`)
- **Subclass:** Minor Alchemist 1 Level (`alchemist`)
- **Remaining Experience Points:** 500
- **Additional Languages:** Speak and read Magitech
- **Special Notes:** Learn Evocation [Vorpal Weapon] (p. 163); write it in the "Techniques, Spellsongs, Stunts" field.

Selectable Races table is printed identically to Hunter's (same 10 races, same Background,
same Skill/Body/Mind — verified against the rendered page image, not a transcription reuse).

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Warrior | 7/9/5 |
| Dwarf | Warrior | 4/11/5 |
| Nightmare | Warrior | 7/15/8 |
| Lykant | Warrior | 10/9/6 |
| Shadow | Warrior | 15/9/3 |
| Runefolk | Warrior | 9/12/5 |
| Lildraken | Warrior | 5/14/6 |
| Soleil | Warrior | 10/15/1 |
| Tiens | Warrior | 8/12/8 |
| Weakling | Warrior | 8/10/5 |

### Dragoon — Courses: Full (p. 37)

- **Primary Class:** Major Fighter 2 Level (`fighter`) or Minor Fencer 2 Level (`fencer`) — the book recommends Elves and Grassrunners pick Fencer
- **Subclass:** Minor Rider 1 Level (`rider`)
- **Remaining Experience Points:** 500 (if Fighter), 1,000 (if Fencer)
- **Additional Languages:** None
- **Special Notes:** Learn Stunt [Enhance Mount] (p. 161). If the primary class is Fencer, the weapon's Critical Threshold is reduced by -1, and the Strength for equipping weapon and armor is halved (rounded up).

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Jockey | 8/8/5 |
| Elves | Jockey | 12/6/8 |
| Dwarf | Jockey | 4/10/6 |
| Nightmare | Jockey | 10/13/7 |
| Lykant | Jockey | 11/8/6 |
| Shadow | Jockey | 13/7/7 |
| Runefolk | Jockey | 10/11/5 |
| Lildraken | Jockey | 6/13/6 |
| Grassrunner | Jockey | 13/1/11 |
| Soleil | Jockey | 11/13/2 |
| Tiens | Jockey | 10/11/7 |
| Weakling | Jockey | 8/8/7 |

---

## Spy Category (p. 38)

### Commando — Courses: Basic, Extended, Full (p. 39)

- **Primary Class:** Major Fighter or Major Grappler 1 Level (`fighter` / `grappler`)
- **Subclass:** Minor Scout 2 Level (`scout`)
- **Remaining Experience Points:** 500
- **Additional Languages:** None
- **Special Notes:** If Grappler is selected, Combat Feat [Chain Attack] (p. 137) is automatically acquired.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Mercenary | 7/10/4 |
| Nightmare | Mercenary | 7/15/8 |
| Lykant | Scout | 13/5/7 |
| Shadow | Scout | 16/7/4 |
| Runefolk | Scout | 12/6/8 |
| Soleil | Scout | 12/11/3 |
| Weakling | Scout | 10/7/6 |

### Tracker — Courses: Basic, Extended, Full (p. 40)

- **Primary Class:** Minor Fencer 2 Level (`fencer`)
- **Subclass:** Minor Scout 2 Level (`scout`)
- **Remaining Experience Points:** 0
- **Additional Languages:** None
- **Special Notes:** Weapon's Critical Threshold reduced by -1.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Agile Warrior | 10/7/4 |
| Elf | Swordsman | 12/5/9 |
| Nightmare | Agile Warrior | 11/13/6 |
| Lykant | Agile Warrior | 12/6/7 |
| Shadow | Swordsman | 17/7/3 |
| Runefolk | Agile Warrior | 11/9/6 |
| Grassrunner | Agile Warrior | 14/1/10 |
| Alv | Agile Warrior | 12/6/7 |
| Soleil | Agile Warrior | 12/12/2 |
| Weakling | Agile Warrior | 9/8/6 |

### Sniper — Courses: Basic, Extended, Full (p. 41)

- **Primary Class:** Minor Marksman 2 Level (`marksman`)
- **Subclass:** Minor Scout 2 Level (`scout`)
- **Remaining Experience Points:** 0
- **Additional Languages:** None
- **Special Notes:** none printed

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Archer | 9/5/7 |
| Elf | Archer | 13/6/8 |
| Nightmare | Archer | 10/10/10 |
| Lykant | Archer | 11/8/6 |
| Shadow | Archer | 18/6/3 |
| Runefolk | Archer | 12/8/6 |
| Grassrunner | Archer | 14/0/11 |
| Alv | Archer | 13/4/8 |
| Soleil | Archer | 11/14/1 |
| Leprechaun | Archer | 12/6/5 |
| Weakling | Archer | 10/8/5 |

---

## Remote Support Category (p. 42)

### Wizard — Courses: Basic, Extended, Full (p. 43)

- **Primary Class:** Major Conjurer 2 Level (`conjurer`)
- **Subclass:** Major Sorcerer 1 Level (`sorcerer`)
- **Remaining Experience Points:** 0
- **Additional Languages:** Speak and Read in Arcana
- **Special Notes:** Can use Spiritualism Magic (p. 143) up to 2nd level and Truespeech Magic (p. 142) up to 1st level. Translator's Note: with Magus Arts, can also cast Deep Magic up to 1st level.

**Class-name flag:** "Wizard" is only the Type's name — there is no class literally called
Wizard in this catalog or the core rules. As pp. 42–43 state and this table confirms, the Type
is built from Major Conjurer 2 + Major Sorcerer 1, i.e. `conjurer` + `sorcerer`.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Conjurer | 7/4/10 |
| Elf | Conjurer | 9/4/13 |
| Tabbit | Conjurer | 6/6/10 |
| Nightmare | Conjurer | 6/11/13 |
| Runefolk | Conjurer | 7/9/10 |
| Meria | Conjurer | 7/6/16 |
| Alv | Conjurer | 9/4/12 |
| Leprechaun | Wizard | 11/3/9 |
| Weakling | Magician | 7/8/8 |

### Fairy Priest — Courses: Extended, Full (p. 44)

- **Primary Class:** Major Priest 2 Level (`priest`)
- **Subclass:** Major Fairy Tamer 1 Level (`fairy-tamer`)
- **Remaining Experience Points:** 0
- **Additional Languages:** Speak and Read in Sylvan
- **Special Notes:** Can use Divine Magic (p. 145) up to 2nd level and 4 types of Fairy Magic (p. 150) up to 1st rank.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Priest | 4/8/9 |
| Elf | Priest | 9/5/12 |
| Dwarf | Priest | 4/7/9 |
| Meria | Priest | 8/8/13 |
| Alv | Priest | 10/6/9 |
| Leprechaun | Priest | 10/5/8 |
| Weakling | Priest | 7/9/7 |

### Druid — Courses: Full (p. 48)

- **Primary Class:** Major Druid 2 Level (`druid`)
- **Subclass:** None printed
- **Remaining Experience Points:** 1,000
- **Additional Languages:** None
- **Special Notes:** Can use Nature Magic (p. 153) up to 2nd level.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Druid | 5/6/10 |
| Elf | Druid | 8/5/13 |
| Dwarf | Druid | 4/7/9 |
| Tabbit | Druid | 5/6/11 |
| Nightmare | Druid | 8/10/12 |
| Meria | Druid | 6/7/16 |
| Leprechaun | Druid | 11/4/8 |
| Weakling | Druid | 7/7/9 |

### Daemonologist — Courses: Full (p. 49)

- **Primary Class:** Major Daemonologist 2 Level (`daemonologist`)
- **Subclass:** None printed
- **Remaining Experience Points:** 1,000
- **Additional Languages:** Speak in Daemonic and Read in Arcana
- **Special Notes:** Can use Summoning Arts (p. 155) up to 2nd level.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Daemonologist | 6/6/9 |
| Elf | Daemonologist | 10/4/12 |
| Tabbit | Daemonologist | 6/6/10 |
| Nightmare | Daemonologist | 7/12/11 |
| Runefolk | Daemonologist | 9/9/8 |
| Meria | Daemonologist | 7/7/15 |
| Alv | Daemonologist | 9/6/10 |
| Leprechaun | Daemonologist | 12/4/7 |
| Weakling | Daemonologist | 7/8/8 |

### Alchemist — Courses: Full (p. 50)

- **Primary Class:** Minor Alchemist 2 Level (`alchemist`)
- **Subclass:** None printed
- **Remaining Experience Points:** 1,500
- **Additional Languages:** Speak and read in Magitech
- **Special Notes:** Pick [Barkmail] and [Paralyzing Mist] Evocations (p. 163); write them in the "Techniques, Spellsongs, Stunts, etc." field.

Note: unlike most other Types, Weakling is **not** selectable here — matches the p. 16 prose
list for this Type, which also omits it.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Alchemist | 7/6/8 |
| Dwarf | Alchemist | 5/9/6 |
| Tabbit | Alchemist | 6/7/9 |
| Nightmare | Alchemist | 11/9/10 |
| Runefolk | Alchemist | 10/9/7 |
| Grassrunner | Alchemist | 13/0/12 |
| Meria | Alchemist | 9/7/13 |
| Leprechaun | Alchemist | 11/5/7 |

### Beastmaster — Courses: Full (p. 51)

- **Primary Class:** Minor Rider 2 Level (`rider`)
- **Subclass:** None printed
- **Remaining Experience Points:** 1,500
- **Additional Languages:** None
- **Special Notes:** Pick [Remote Command] and [Enhance Mount] Stunts (p. 161); write them in the "Techniques, Spellsongs, Stunts, etc." field.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Jockey | 8/8/5 |
| Elf | Jockey | 12/6/8 |
| Dwarf | Jockey | 4/10/6 |
| Nightmare | Jockey | 10/13/5 |
| Runefolk | Jockey | 10/11/5 |
| Grassrunner | Jockey | 13/1/11 |
| Meria | Jockey | 8/9/12 |
| Leprechaun | Jockey | 13/6/4 |
| Weakling | Jockey | 8/8/7 |

---

## Magic Warrior Category (p. 52)

### Spellpuncher — Courses: Basic, Extended, Full (p. 53)

- **Primary Class:** Major Grappler 1 Level (`grappler`)
- **Subclass:** Any one of: Major Sorcerer 2 Level (`sorcerer`) / Major Conjurer 2 Level (`conjurer`) / Major Priest 2 Level, cannot be a Runefolk (`priest`) / Major Fairy Tamer 2 Level, cannot be a Runefolk (`fairy-tamer`) / Major Druid 2 Level, cannot be a Runefolk (`druid`) / Major Daemonologist 2 Level (`daemonologist`)
- **Remaining Experience Points:** 0
- **Additional Languages:** Depends on the subclass — Sorcerer or Conjurer: Speak and Read Arcana; Fairy Tamer: Speak Sylvan; Daemonologist: Speak Daemonic and Read Arcana (Priest and Druid: none printed)
- **Special Notes:** Up to 2 levels of the chosen magic system can be used, per the subclass. A Daemonologist subclass grants "Gate Imp" and the ability to summon Daemons (see Monstrous Lore p. 28). Automatically acquires Combat Feat [Chain Attack] (p. 137).

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Boxer | 8/8/5 |
| Elf | Boxer | 11/4/11 |
| Dwarf | Boxer | 5/10/5 |
| Nightmare | Mercenary | 7/15/8 |
| Runefolk | Warrior | 9/12/5 |
| Lildraken | Boxer | 6/13/6 |
| Alv | Boxer | 11/7/7 |
| Weakling | Boxer | 9/9/5 |

### Grove Defender — Courses: Full (p. 54)

- **Primary Class:** Major Fighter 2 Level (`fighter`)
- **Subclass:** Major Druid 1 Level (`druid`)
- **Remaining Experience Points:** 0
- **Additional Languages:** None
- **Special Notes:** Can cast Nature Magic (p. 153) up to 1st level.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Warrior | 7/9/5 |
| Dwarf | Warrior | 4/11/5 |
| Nightmare | Mercenary | 7/15/8 |
| Lildraken | Warrior | 5/14/6 |
| Tiens | Warrior | 8/12/8 |
| Weakling | Warrior | 8/10/5 |

### Summoning Warrior — Courses: Full (p. 55)

- **Primary Class:** Major Fighter 2 Level (`fighter`)
- **Subclass:** Major Daemonologist 1 Level (`daemonologist`)
- **Remaining Experience Points:** 0
- **Additional Languages:** Speak Daemonic and Read Arcana
- **Special Notes:** Can cast Summoning Arts (p. 155) up to 2nd level. Has "Gate Imp" and can summon Daemons (see Monstrous Lore p. 28).

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Warrior | 7/9/5 |
| Dwarf | Warrior | 4/11/5 |
| Nightmare | Mercenary | 7/15/8 |
| Runefolk | Warrior | 9/12/5 |
| Lildraken | Warrior | 5/14/6 |
| Alv | Daemonologist | 9/6/10 |
| Tiens | Warrior | 8/12/8 |
| Weakling | Warrior | 8/10/5 |

### Leafblade — Courses: Full (p. 56)

- **Primary Class:** Minor Fencer 2 Level (`fencer`)
- **Subclass:** Major Druid 1 Level (`druid`)
- **Remaining Experience Points:** 500
- **Additional Languages:** None
- **Special Notes:** Can cast Nature Magic (p. 153) up to 1st level. Weapon's Critical Threshold reduced by -1.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Swordsman | 9/6/6 |
| Dwarf | Swordsman | 12/5/9 |
| Meria | Agile Warrior | 10/8/11 |
| Alv | Agile Warrior | 12/6/7 |
| Leprechaun | Agile Warrior | 13/5/5 |
| Weakling | Agile Warrior | 9/8/6 |

**Race-list flag:** the printed Selectable Races table has **Dwarf** as its second row. The
category-overview prose on p. 17 instead lists "Humans, Elves, Meria, Alves, Leprechauns,
Weaklings" (Elves, not Dwarves) for this Type. Confirmed by both the rendered page image and
an independent `pdftotext -layout` pass — the table itself says Dwarf. Transcribed as printed
in the table (the mechanically authoritative source), with this discrepancy flagged rather than
silently resolved.

### Daemonblade — Courses: Full (p. 57)

- **Primary Class:** Minor Fencer 1 Level (`fencer`)
- **Subclass:** Major Daemonologist 2 Level (`daemonologist`)
- **Remaining Experience Points:** 500
- **Additional Languages:** Speak Daemonic and Read Arcana
- **Special Notes:** Can cast Summoning Arts (p. 155) up to 2nd level. Has "Gate Imp" and can summon Daemons (see Monstrous Lore p. 28). Weapon's Critical Threshold reduced by -1.

| Race | Background | Skill/Body/Mind |
|---|---|---|
| Human | Swordsman | 9/6/6 |
| Elves | Swordsman | 12/5/9 |
| Runefolk | Agile Warrior | 11/9/6 |
| Meria | Agile Warrior | 10/8/11 |
| Alv | Agile Warrior | 12/6/7 |
| Leprechaun | Agile Warrior | 13/5/5 |
| Weakling | Agile Warrior | 9/8/6 |

---

## What's on the sheet vs. what isn't

Nothing implemented yet — this file is research only. A future Vagrant feature would need: a
Category → Type picker, each Type's fixed Primary/Subclass/XP/Languages/Special Notes
applied instead of the normal free class pick, and its Selectable Races table replacing the
normal racial-dice + Background-roll flow for that one character. See `docs/sheet-content/01-races.md`'s
"Outlaw Profile Book" section for the 4 Vagrant-only races (Alv, Shadow, Soleil, Weakling) that
several of these tables draw on — none of them have the usual A–F correction dice, only the
fixed Skill/Body/Mind values given per Type above.

## Transcription notes

- **17 of 17 Types transcribed**, all 4 Categories, matching the book's own count on pp. 16–17.
- **All 17 pages rendered as images** (pp. 34–57 excluding the skipped essay/sidebar pages)
  and used as the source of truth for every Selectable Races table, because `pdftotext -layout`
  misaligned the race-name column against the Background/SBM columns on effectively every
  page in this range (two-column layout with prose running alongside the table). Race counts
  were cross-checked against the p. 16–17 "Selectable races: ..." prose for every single Type;
  all matched except the one flagged below.
- **One class-name mismatch flagged:** the Wizard Type (p. 43) is not built from a class called
  "Wizard" — it's Major Conjurer 2 Level (`conjurer`) + Major Sorcerer 1 Level (`sorcerer`), per
  the book's own intro text on pp. 42–43 and confirmed by the Adventurous Aptitude block itself.
- **One race-list discrepancy flagged:** Leafblade's (p. 56) printed Selectable Races table lists
  Dwarf; the p. 17 category-overview prose says Elves instead, for the same Type. Table taken
  as authoritative; discrepancy noted in place rather than silently corrected.
- No other class-name or rank mismatches found — every Major/Minor rank printed in this range
  matches the `rank` field already recorded for that class's `id` in `src/data/classes.ts`.
