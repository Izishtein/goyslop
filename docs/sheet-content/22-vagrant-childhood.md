# Vagrant — Childhood Experience Tables (§ 3 optional system)

Source: **Outlaw Profile Book** pp. 74–95. This is one piece of the larger "Vagrant" optional
character-creation system (a non-adventurer PC built with d66/d6 tables instead of the normal
race-dice-plus-class-pick flow). A Vagrant character does not roll the normal racial A-F
correction dice; instead, once the player has picked a race and a **Category** (Warrior / Spy /
Remote Support / Magic Warrior), they roll on the one Childhood Experience table for that
{race} × {category} pair. The result is a fixed **Ability Score Correction** (six numbers,
A through F, in that order), an **Experience** name, optionally a **Focus** tag printed in
parentheses right after the name (e.g. "(Focus on Accuracy)", "(Balance)" — a separate table
elsewhere in the Vagrant system keys off this tag), and sometimes a **Deprecated Type** column
listing character Types barred from that roll (reroll if you have one of them).

Each race also prints its own "Life Segments" table (childhood/juvenile/adolescence/adult age/
life-expectancy coefficient) directly above its Childhood Experience tables — not transcribed
here, out of scope for this catalog the same way it's out of scope for the other races' aging
tables elsewhere in this project. The long prose "Explanation" column printed next to every row
is likewise **not transcribed**, matching the established house convention for this repo:
catalogs carry mechanical/index data only, never the book's descriptive flavor text (same rule
already applied to spells, Techniques, Evocations, and Work Skills).

## The headline finding: not every race gets all 4 categories

The task of "56 tables" (14 races × 4 categories) does not match what the book actually prints.
**Only 46 tables exist.** Some races get all 4 categories; several get 2 or 3; one race
(Tabbit) gets exactly **1**. This was cross-checked against rendered page images wherever the
category count looked suspicious (every case below), not just trusted from `pdftotext`:

| Race | Categories present | Count |
|---|---|---|
| Human | Warrior, Spy, Remote Support, Magic Warrior | 4 |
| Elven | Warrior, Spy, Remote Support, Magic Warrior (D6) | 4 |
| Dwarven | Warrior, Remote Support, Magic Warrior | 3 |
| Tabbit | Remote Support | 1 |
| Runefolk | Warrior, Spy, Remote Support, Magic Warrior | 4 |
| Nightmare | Warrior, Spy, Remote Support, Magic Warrior | 4 |
| Lykant | Warrior, Spy | 2 |
| Lildraken | Warrior, Magic Warrior | 2 |
| Grassrunner | Warrior, Spy, Remote Support (D6) | 3 |
| Meria | Remote Support, Magic Warrior (D6) | 2 |
| Tiens | Warrior, Magic Warrior | 2 |
| Leprechaun | Spy, Remote Support, Magic Warrior (D6) | 3 |
| Alv | Warrior, Spy, Remote Support, Magic Warrior (D6) | 4 |
| Weakling | Warrior, Spy, Remote Support, Magic Warrior | 4 |
| Shadow | Warrior, Spy | 2 |
| Soleil | Warrior, Spy | 2 |

Total: **46 tables**. A handful of "Magic Warrior" and one "Remote Support" table (Elven,
Grassrunner, Meria, Leprechaun, Alv) are printed as a plain **D6** table (1–6, six rows) rather
than a D66 table — also confirmed against the page image, not a `pdftotext` artifact.

## Table format

```
### {Race} — {Category} Category [(D6)]

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| ... |
```

"Deprecated" is omitted as a column where the book prints no such column at all for that table
(noted per table below); where the column exists but a given row has none, the cell reads "None".

---

## Human (p. 74–75)

### Human — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-12 | None | Lived as a Hunter (Focus on Accuracy) | 11 | 5 | 7 | 7 | 4 | 4 |
| 13-14 | None | Caring for Tools (Focus on Accuracy) | 11 | 5 | 7 | 7 | 4 | 4 |
| 15-16 | None | Means of Survival (Focus on Accuracy) | 11 | 5 | 7 | 7 | 4 | 4 |
| 21-22 | None | Natural (Balance) | 8 | 8 | 8 | 8 | 5 | 5 |
| 23-24 | None | Excellent Educational Environment (Balance) | 8 | 8 | 8 | 8 | 5 | 5 |
| 25-26 | None | Overflowing Curiosity (Balance) | 8 | 8 | 8 | 8 | 5 | 5 |
| 31-32 | None | Explorer Helper (Generic Search) | 8 | 7 | 6 | 7 | 8 | 6 |
| 33-34 | None | Keen Intuition (Generic Search) | 8 | 7 | 6 | 7 | 8 | 6 |
| 35-36 | None | Quick-witted Child (Generic Search) | 8 | 7 | 6 | 7 | 8 | 6 |
| 41-42 | None | Playing in Forests and Rivers (Focus on Evasion) | 5 | 11 | 6 | 6 | 5 | 5 |
| 43-44 | None | Courier (Focus on Evasion) | 5 | 11 | 6 | 6 | 5 | 5 |
| 45-46 | None | Life of Danger (Focus on Evasion) | 5 | 11 | 6 | 6 | 5 | 5 |
| 51-52 | Sworder | The Little Hero (Focus on Striking) | 5 | 5 | 11 | 7 | 5 | 5 |
| 53-54 | Sworder | Indomitable (Focus on Striking) | 5 | 5 | 11 | 7 | 5 | 5 |
| 55-56 | Sworder | Days of Training (Focus on Striking) | 5 | 5 | 11 | 7 | 5 | 5 |
| 61-62 | Sworder, Boxer | Harsh Environments (Focus on Durability) | 5 | 5 | 9 | 9 | 5 | 9 |
| 63-64 | Sworder, Boxer | Poor Living (Focus on Durability) | 5 | 5 | 9 | 9 | 5 | 9 |
| 65-66 | Sworder, Boxer | Life in a War Zone (Focus on Durability) | 5 | 5 | 9 | 9 | 5 | 9 |

Note: the deprecated type "Sworder" also includes "Dragoon (Fencer)".

### Human — Spy Category

(No Deprecated column in the book for this table.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | First Striker (Combat Oriented) | 8 | 8 | 8 | 6 | 8 | 4 |
| 15-22 | Ambusher (Combat Oriented) | 8 | 8 | 8 | 6 | 8 | 4 |
| 23-26 | Aggressive (Combat Oriented) | 8 | 8 | 8 | 6 | 8 | 4 |
| 31-34 | Prepared for Anything (General Purpose) | 6 | 6 | 8 | 7 | 8 | 7 |
| 35-42 | Jack of all Trades (General Purpose) | 6 | 6 | 8 | 7 | 8 | 7 |
| 43-46 | Shorthanded (General Purpose) | 8 | 6 | 8 | 7 | 8 | 7 |
| 51-54 | Keen Insight (Search Oriented) | 8 | 3 | 5 | 5 | 11 | 6 |
| 55-62 | Mind Reader (Search Oriented) | 8 | 3 | 5 | 5 | 11 | 6 |
| 63-66 | Learning and Practice (Search Oriented) | 8 | 3 | 5 | 5 | 11 | 6 |

### Human — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Learned to Aim for Prey (Focus on Accuracy) | 9 | 5 | 9 | 7 | 5 | 7 |
| 14-16 | All except Archer | With Weapons at Hand (Focus on Accuracy) | 9 | 5 | 9 | 7 | 5 | 7 |
| 21-23 | All except Archer | Advantageous Position (Focus on Accuracy) | 9 | 5 | 9 | 7 | 5 | 7 |
| 24-26 | None | Carrying Voice (Focus on Spirit) | 8 | 6 | 3 | 7 | 3 | 11 |
| 31-33 | None | Child of Mana (Focus on Spirit) | 8 | 6 | 3 | 7 | 3 | 11 |
| 34-36 | None | Withstand Magic (Focus on Spirit) | 8 | 6 | 3 | 7 | 3 | 11 |
| 41-43 | None | Recluse's Caretaker (General Wizard) | 8 | 5 | 5 | 6 | 9 | 9 |
| 44-46 | None | Met with Fairies (General Wizard) | 8 | 5 | 5 | 6 | 9 | 9 |
| 51-53 | None | Learning in the Temple (General Wizard) | 8 | 5 | 5 | 6 | 9 | 9 |
| 54-56 | Archer | Wizard's Apprentice (Pure Wizardry) | 3 | 3 | 3 | 7 | 11 | 10† |
| 61-63 | Archer | Learned about Daemons (Pure Wizardry) | 3 | 3 | 3 | 7 | 11 | 10† |
| 64-66 | Archer | Thirst for Knowledge (Pure Wizardry) | 3 | 3 | 3 | 7 | 11 | 10† |

† Book anomaly, confirmed against the rendered page image (not a `pdftotext` misread): these
three rows print "A3 B3 C3 D7 E11 E10" — the sixth value is labeled **E10**, not **F10**. Given
every other row in this book strictly follows A-B-C-D-E-F order and no row anywhere else repeats
a letter, this reads as a genuine book typo (F meant, E printed). Transcribed above as the
value 10 in the F column with the mislabel flagged, rather than silently "fixed."

### Human — Magic Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-14 | None | Gushing Mana (Accuracy + Magic Power) | 9 | 3 | 3 | 5 | 11 | 7 |
| 15-22 | None | Magic Through Weapons (Accuracy + Magic Power) | 9 | 3 | 3 | 5 | 11 | 7 |
| 23-26 | None | Touched by Magic Items (Accuracy + Magic Power) | 9 | 3 | 3 | 5 | 11 | 7 |
| 31-34 | None | Magic Warrior Child (Balance) | 8 | 8 | 8 | 6 | 8 | 6 |
| 35-42 | None | Wunderkind (Balance) | 8 | 8 | 8 | 6 | 8 | 6 |
| 43-46 | None | Learn at Your Own Pace (Balance) | 8 | 8 | 8 | 6 | 8 | 6 |
| 51-54 | Spellpuncher, **Sworder, Artificer | Harsh Environments (Focus on Durability) | 5 | 3 | 9 | 9 | 7 | 9 |
| 55-62 | Spellpuncher, **Sworder, Artificer | With Patience (Focus on Durability) | 5 | 3 | 9 | 9 | 7 | 9 |
| 63-66 | Spellpuncher, **Sworder, Artificer | Healing a Serious Injury by Yourself (Focus on Durability) | 5 | 3 | 9 | 9 | 7 | 9 |

Note: "**Sworder" refers to Magic Sworder, Leafblade, Daemonblade, etc. — Types using the Fencer class.

---

## Elven (p. 76–77)

### Elven — Warrior Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-13 | Self-aware Child (Focus on Accuracy) | 10 | 7 | 4 | 7 | 5 | 4 |
| 14-16 | Through Battles (Focus on Accuracy) | 10 | 7 | 4 | 7 | 5 | 4 |
| 21-23 | Rain Child (Focus on Accuracy) | 10 | 7 | 4 | 7 | 5 | 4 |
| 24-26 | Growing up on the Border (Balance) | 7 | 7 | 4 | 7 | 6 | 7 |
| 31-33 | Destroyed Homeland (Balance) | 7 | 7 | 4 | 7 | 6 | 7 |
| 34-36 | Upstart Thinking (Balance) | 7 | 7 | 4 | 7 | 6 | 7 |
| 41-43 | Forest Protector (Generic Search) | 7 | 7 | 4 | 6 | 9 | 5 |
| 44-46 | Water Protection (Generic Search) | 7 | 7 | 4 | 6 | 9 | 5 |
| 51-53 | Gem Collector (Generic Search) | 7 | 7 | 4 | 6 | 9 | 5 |
| 54-56 | Horrible Neighbors (Focus on Evasion) | 7 | 11 | 3 | 6 | 4 | 4 |
| 61-63 | Hail of Bullets (Focus on Evasion) | 7 | 11 | 3 | 6 | 4 | 4 |
| 64-66 | The Evil Hand of Justice (Focus on Evasion) | 7 | 11 | 3 | 6 | 4 | 4 |

### Elven — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Monster Attack (Combat Oriented) | 7 | 6 | 4 | 7 | 8 | 6 |
| 15-22 | Lurking in the Darkness (Combat Oriented) | 7 | 6 | 4 | 7 | 8 | 6 |
| 23-26 | Lost Life (Combat Oriented) | 7 | 6 | 4 | 7 | 8 | 6 |
| 31-34 | Ancient Wisdom (General Purpose) | 8 | 8 | 4 | 5 | 8 | 5 |
| 35-42 | Evil Organization (General Purpose) | 8 | 8 | 4 | 5 | 8 | 5 |
| 43-46 | Aristocratic Society (General Purpose) | 8 | 8 | 4 | 5 | 8 | 5 |
| 51-54 | Deep into the Forest (Search Oriented) | 9 | 9 | 2 | 5 | 9 | 5 |
| 55-62 | Tower of Wisdom (Search Oriented) | 9 | 9 | 2 | 5 | 9 | 5 |
| 63-66 | Setting Traps (Search Oriented) | 9 | 9 | 2 | 5 | 9 | 5 |

### Elven — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Archery Master (Focus on Accuracy) | 11 | 3 | 5 | 5 | 5 | 5 |
| 14-16 | All except Archer | Sun Child (Focus on Accuracy) | 11 | 3 | 5 | 5 | 5 | 5 |
| 21-23 | All except Archer | Firearms Factory (Focus on Accuracy) | 11 | 3 | 5 | 5 | 5 | 5 |
| 24-26 | None | Choir (Focus on Spirit) | 7 | 3 | 2 | 6 | 6 | 11 |
| 31-33 | None | Clear Mind (Focus on Spirit) | 7 | 3 | 2 | 6 | 6 | 11 |
| 34-36 | None | Fairy Circle (Focus on Spirit) | 7 | 3 | 2 | 6 | 6 | 11 |
| 41-43 | None | Magic Academy (General Wizard) | 9 | 5 | 2 | 5 | 10 | 7 |
| 44-46 | None | Hermit Assignment (General Wizard) | 9 | 5 | 2 | 5 | 10 | 7 |
| 51-53 | None | Young Adventurers (General Wizard) | 9 | 5 | 2 | 5 | 10 | 7 |
| 54-56 | Archer | Book of Secrets (Pure Wizardry) | 3 | 3 | 2 | 5 | 11 | 10 |
| 61-63 | Archer | Mana Fountain (Pure Wizardry) | 3 | 3 | 2 | 5 | 11 | 10 |
| 64-66 | Archer | Magical Old Wounds (Pure Wizardry) | 3 | 3 | 2 | 5 | 11 | 10 |

### Elven — Magic Warrior Category (D6)

Genuinely a **D6** table in the book (1–6), not D66 — confirmed against the rendered page image.

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 1 | Sniper (Accuracy + Magic Power) | 10 | 6 | 2 | 5 | 9 | 6 |
| 2 | Temple Bells (Accuracy + Magic Power) | 10 | 6 | 2 | 5 | 9 | 6 |
| 3 | Around Magic Items (Accuracy + Magic Power) | 10 | 6 | 2 | 5 | 9 | 6 |
| 4 | Young Adventurers (Balance) | 7 | 7 | 3 | 7 | 9 | 6 |
| 5 | Kitchen (Balance) | 7 | 7 | 3 | 7 | 9 | 6 |
| 6 | Sea Hunter (Balance) | 7 | 7 | 3 | 7 | 9 | 6 |

---

## Dwarven (p. 78–79)

No Spy Category table exists for Dwarven in this book — confirmed against the rendered page
image (Warrior is immediately followed by Remote Support, no gap or skipped page).

### Dwarven — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | None | Street Child (Focus on Accuracy) | 16 | 2 | 8 | 8 | 2 | 11 |
| 14-16 | None | Exquisite Workmanship (Focus on Accuracy) | 16 | 2 | 8 | 8 | 2 | 11 |
| 21-23 | None | Accurate Shooting (Focus on Accuracy) | 16 | 2 | 8 | 8 | 2 | 11 |
| 24-26 | None | Mineral Exploration (Generic Search) | 15 | 5 | 5 | 5 | 5 | 11 |
| 31-33 | None | Longing for Treasure (Generic Search) | 15 | 5 | 5 | 5 | 5 | 11 |
| 34-36 | None | Wanderlust (Generic Search) | 15 | 5 | 5 | 5 | 5 | 11 |
| 41-43 | None | Superior Physical Strength (Focus on Striking) | 14 | 2 | 10 | 8 | 2 | 11 |
| 44-46 | None | Helped with Blacksmithing (Focus on Striking) | 14 | 2 | 10 | 8 | 2 | 11 |
| 51-53 | None | Trained Martial Arts (Focus on Striking) | 14 | 2 | 10 | 8 | 2 | 11 |
| 54-56 | Boxer | Harsh Environments (Focus on Durability) | 14 | 1 | 9 | 10 | 1 | 12 |
| 61-63 | Boxer | With Patience (Focus on Durability) | 14 | 1 | 9 | 10 | 1 | 12 |
| 64-66 | Boxer | Returned Back from the Brink of Death (Focus on Durability) | 14 | 1 | 9 | 10 | 1 | 12 |

### Dwarven — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Mountain-Bred (Focus on Accuracy) | 16 | 1 | 6 | 7 | 4 | 12 |
| 14-16 | All except Archer | Unparalleled Accuracy (Focus on Accuracy) | 16 | 1 | 6 | 7 | 4 | 12 |
| 21-23 | All except Archer | Axe-Slinging (Focus on Accuracy) | 16 | 1 | 6 | 7 | 4 | 12 |
| 24-26 | None | Traditional Singers (Focus on Spirit) | 14 | 1 | 5 | 6 | 4 | 12 |
| 31-33 | None | Excellent Conjurer (Focus on Spirit) | 14 | 1 | 5 | 6 | 4 | 12 |
| 34-36 | None | Inside the Kiln (Focus on Spirit) | 14 | 1 | 5 | 6 | 4 | 12 |
| 41-43 | None | Friends in Flames (General Wizard) | 12 | 3 | 3 | 7 | 6 | 15 |
| 44-46 | None | Heard God (General Wizard) | 12 | 3 | 3 | 7 | 6 | 15 |
| 51-53 | None | Golem Workshop (General Wizard) | 12 | 3 | 3 | 7 | 6 | 15 |
| 54-56 | Archer | Longing for the Magic Way (Pure Wizardry) | 8 | 1 | 3 | 7 | 6 | 17 |
| 61-63 | Archer | Lost in a Mysterious Forest (Pure Wizardry) | 8 | 1 | 3 | 7 | 6 | 17 |
| 64-66 | Archer | Heard the Evil Voice (Pure Wizardry) | 8 | 1 | 3 | 7 | 6 | 17 |

### Dwarven — Magic Warrior Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Forger of the Magic Sword (Accuracy + Magic Power) | 16 | 1 | 4 | 6 | 6 | 12 |
| 15-22 | Bomb Squad (Accuracy + Magic Power) | 16 | 1 | 4 | 6 | 6 | 12 |
| 23-26 | Touched by Magic Items (Accuracy + Magic Power) | 16 | 1 | 4 | 6 | 6 | 12 |
| 31-34 | Picked up by a Wandering Paladin (Balance) | 14 | 2 | 7 | 7 | 5 | 12 |
| 35-42 | Wind in the Heart (Balance) | 14 | 2 | 7 | 7 | 5 | 12 |
| 43-46 | Learned from Nature (Balance) | 14 | 2 | 7 | 7 | 5 | 12 |
| 51-54 | Harsh Battle (Focus on Durability) | 13 | 2 | 7 | 9 | 2 | 15 |
| 55-62 | Unfair Treatment (Focus on Durability) | 13 | 2 | 7 | 9 | 2 | 15 |
| 63-66 | Trained as Paladin (Focus on Durability) | 13 | 2 | 7 | 9 | 2 | 15 |

---

## Tabbit (p. 79)

**Only one category exists for Tabbit in this book: Remote Support.** No Warrior, Spy, or
Magic Warrior table is printed for this race — confirmed against the rendered page image: the
Remote Support table's last row is followed only by white space and the page-79 footer, then
Runefolk's own header begins fresh on page 80.

### Tabbit — Remote Support Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Beautiful Voice (Focus on Spirit) | 2 | 2 | 1 | 6 | 13 | 11 |
| 15-22 | Perfect Pitch (Focus on Spirit) | 2 | 2 | 1 | 6 | 13 | 11 |
| 23-26 | Traveling Singing Rabbit (Focus on Spirit) | 2 | 2 | 1 | 6 | 13 | 11 |
| 31-34 | Mad Wizard (General Wizard) | 5 | 1 | 1 | 6 | 16 | 8 |
| 35-42 | Spent Time in the Deep Woods (General Wizard) | 5 | 1 | 1 | 6 | 16 | 8 |
| 43-46 | Slum Wizard (General Wizard) | 5 | 1 | 1 | 6 | 16 | 8 |
| 51-54 | Wizard's Apprentice (Pure Wizardry) | 1 | 1 | 1 | 4 | 17 | 10 |
| 55-62 | Gifted (Pure Wizardry) | 1 | 1 | 1 | 4 | 17 | 10 |
| 63-66 | Daemon's Whispers (Pure Wizardry) | 1 | 1 | 1 | 4 | 17 | 10 |

---

## Runefolk (p. 80–81)

### Runefolk — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | None | Excellent Eyesight (Focus on Accuracy) | 10 | 3 | 9 | 8 | 3 | 2 |
| 14-16 | None | Precision Work Days (Focus on Accuracy) | 10 | 3 | 9 | 8 | 3 | 2 |
| 21-23 | None | Linked Eyes and Fingers (Focus on Accuracy) | 10 | 3 | 9 | 8 | 3 | 2 |
| 24-26 | None | Outdoor Work (Generic Search) | 9 | 3 | 6 | 6 | 7 | 4 |
| 31-33 | None | Worked as Servant (Generic Search) | 9 | 3 | 6 | 6 | 7 | 4 |
| 34-36 | None | Worked as Escort (Generic Search) | 9 | 3 | 6 | 6 | 7 | 4 |
| 41-43 | Sworder | Strived to Increase Strength (Focus on Striking) | 9 | 3 | 10 | 8 | 3 | 2 |
| 44-46 | Sworder | Prepared for Battle (Focus on Striking) | 9 | 3 | 10 | 8 | 3 | 2 |
| 51-53 | Sworder | Built for Battle (Focus on Striking) | 9 | 3 | 10 | 8 | 3 | 2 |
| 54-56 | Sworder, Boxer | Master's Shield (Focus on Durability) | 9 | 3 | 9 | 7 | 3 | 4 |
| 61-63 | Sworder, Boxer | Endure the Harshness (Focus on Durability) | 9 | 3 | 9 | 7 | 3 | 4 |
| 64-66 | Sworder, Boxer | Terrible Master (Focus on Durability) | 9 | 3 | 9 | 7 | 3 | 4 |

Note: the deprecated type "Sworder" also includes "Dragoon (Fencer)".

### Runefolk — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Weaken in Advance (Combat Oriented) | 8 | 4 | 8 | 8 | 4 | 3 |
| 15-22 | Studies the Vital Points (Combat Oriented) | 8 | 4 | 8 | 8 | 4 | 3 |
| 23-26 | Trained for Combat (Combat Oriented) | 8 | 4 | 8 | 8 | 4 | 3 |
| 31-34 | For Survival (General Purpose) | 7 | 4 | 7 | 7 | 7 | 3 |
| 35-42 | Speedy (General Purpose) | 7 | 4 | 7 | 7 | 7 | 3 |
| 43-46 | Under Strict Demands (General Purpose) | 7 | 4 | 7 | 7 | 7 | 3 |
| 51-54 | Night Training (Search Oriented) | 7 | 3 | 5 | 5 | 10 | 4 |
| 55-62 | Lost Something Important (Search Oriented) | 7 | 3 | 5 | 5 | 10 | 4 |
| 63-66 | Vigilant (Search Oriented) | 7 | 3 | 5 | 5 | 10 | 4 |

### Runefolk — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Ranged Weapons Preference (Focus on Accuracy) | 12 | 1 | 3 | 3 | 6 | 2 |
| 14-16 | All except Archer | Hunting Job (Focus on Accuracy) | 12 | 1 | 3 | 3 | 6 | 2 |
| 21-23 | All except Archer | Excellent Eyesight (Focus on Accuracy) | 12 | 1 | 3 | 3 | 6 | 2 |
| 24-26 | None | Soul Searching (Focus on Spirit) | 10 | 2 | 3 | 3 | 9 | 6 |
| 31-33 | None | Carrying Voice (Focus on Spirit) | 10 | 2 | 3 | 3 | 9 | 6 |
| 34-36 | None | Beautiful Form (Focus on Spirit) | 10 | 2 | 3 | 3 | 9 | 6 |
| 41-43 | None | Broad Aptitude (General Wizard) | 5 | 5 | 4 | 4 | 10 | 5 |
| 44-46 | None | Driven by Magic (General Wizard) | 5 | 5 | 4 | 4 | 10 | 5 |
| 51-53 | None | To Save Someone (General Wizard) | 5 | 5 | 4 | 4 | 10 | 5 |
| 54-56 | Archer | Innate Functions (Pure Wizardry) | 3 | 1 | 2 | 3 | 12 | 5 |
| 61-63 | Archer | Fast Knowledge Absorption (Pure Wizardry) | 3 | 1 | 2 | 3 | 12 | 5 |
| 64-66 | Archer | Born for Magical Warfare (Pure Wizardry) | 3 | 1 | 2 | 3 | 12 | 5 |

Note: this table's raw text layer heavily interleaves Ability Score Correction digits with the
Explanation prose column (e.g. "F2From the time..."); every row here was cross-checked against
the rendered page image and the numbers match the de-interleaved reading exactly.

### Runefolk — Magic Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-14 | None | Magic is a Weapon (Accuracy + Magic Power) | 11 | 1 | 2 | 2 | 10 | 4 |
| 15-22 | None | Felt Mana Flow (Accuracy + Magic Power) | 11 | 1 | 2 | 2 | 10 | 4 |
| 23-26 | None | Understanding the Magic of Battle (Accuracy + Magic Power) | 11 | 1 | 2 | 2 | 10 | 4 |
| 31-34 | None | Someone's Whispering (Balance) | 9 | 3 | 7 | 5 | 9 | 3 |
| 35-42 | None | All Rounded Knowledge (Balance) | 9 | 3 | 7 | 5 | 9 | 3 |
| 43-46 | None | Strict Master (Balance) | 9 | 3 | 7 | 5 | 9 | 3 |
| 51-54 | Spellpuncher, **Sworder, Artificer | Shield of the Weak (Focus on Durability) | 3 | 3 | 8 | 9 | 7 | 5 |
| 55-62 | Spellpuncher, **Sworder, Artificer | Abandoned (Focus on Durability) | 3 | 3 | 8 | 9 | 7 | 5 |
| 63-66 | Spellpuncher, **Sworder, Artificer | Healing Injuries (Focus on Durability) | 3 | 3 | 8 | 9 | 7 | 5 |

Note: "**Sworder" refers to Magic Sworder, Leafblade, Daemonblade, etc. — Types using the Fencer class.

---

## Nightmare (p. 82–83)

### Nightmare — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-12 | None | Lived as a Hunter (Focus on Accuracy) | 11 | 5 | 3 | 4 | 3 | 5 |
| 13-14 | None | Craftsmanship Qualities (Focus on Accuracy) | 11 | 5 | 3 | 4 | 3 | 5 |
| 15-16 | None | Means of Survival (Focus on Accuracy) | 11 | 5 | 3 | 4 | 3 | 5 |
| 21-22 | None | Natural (Balance) | 8 | 8 | 4 | 4 | 5 | 5 |
| 23-24 | None | Excellent Educational Environment (Balance) | 8 | 8 | 4 | 4 | 5 | 5 |
| 25-26 | None | Overflowing Curiosity (Balance) | 8 | 8 | 4 | 4 | 5 | 5 |
| 31-32 | None | Explorer Helper (Generic Search) | 7 | 7 | 4 | 3 | 8 | 6 |
| 33-34 | None | Keen Intuition (Generic Search) | 7 | 7 | 4 | 3 | 8 | 6 |
| 35-36 | None | Quick-witted Child (Generic Search) | 7 | 7 | 4 | 3 | 8 | 6 |
| 41-42 | None | Playing in Forests and Rivers (Focus on Evasion) | 5 | 11 | 3 | 3 | 5 | 5 |
| 43-44 | None | Courier (Focus on Evasion) | 5 | 11 | 3 | 3 | 5 | 5 |
| 45-46 | None | Erasing Past (Focus on Evasion) | 5 | 11 | 3 | 3 | 5 | 5 |
| 51-52 | Sworder | The Little Hero (Focus on Striking) | 7 | 7 | 6 | 4 | 5 | 4 |
| 53-54 | Sworder | Indomitable (Focus on Striking) | 7 | 7 | 6 | 4 | 5 | 4 |
| 55-56 | Sworder | Days of Training (Focus on Striking) | 7 | 7 | 6 | 4 | 5 | 4 |
| 61-62 | Sworder, Boxer | Harsh Environments (Focus on Durability) | 5 | 5 | 5 | 5 | 5 | 9 |
| 63-64 | Sworder, Boxer | Poor Living (Focus on Durability) | 5 | 5 | 5 | 5 | 5 | 9 |
| 65-66 | Sworder, Boxer | Life in a War Zone (Focus on Durability) | 5 | 5 | 5 | 5 | 5 | 9 |

Note: the deprecated type "Sworder" also includes "Dragoon (Fencer)".

### Nightmare — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | First Striker (Combat Oriented) | 7 | 7 | 5 | 2 | 6 | 8 |
| 15-22 | Ambusher (Combat Oriented) | 7 | 7 | 5 | 2 | 6 | 8 |
| 23-26 | Aggressive (Combat Oriented) | 7 | 7 | 5 | 2 | 6 | 8 |
| 31-34 | Prepared Is Essential (General Purpose) | 7 | 7 | 3 | 3 | 8 | 8 |
| 35-42 | Jack of all Trades (General Purpose) | 7 | 7 | 3 | 3 | 8 | 8 |
| 43-46 | Shorthanded (General Purpose) | 7 | 7 | 3 | 3 | 8 | 8 |
| 51-54 | Keen Insight (Search Oriented) | 8 | 7 | 2 | 1 | 10 | 7 |
| 55-62 | Mind Reader (Search Oriented) | 8 | 7 | 2 | 1 | 10 | 7 |
| 63-66 | Learning and Practice (Search Oriented) | 8 | 7 | 2 | 1 | 10 | 7 |

### Nightmare — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Learned to Aim for Prey (Focus on Accuracy) | 10 | 3 | 5 | 2 | 8 | 6 |
| 14-16 | All except Archer | With Weapons at Hand (Focus on Accuracy) | 10 | 3 | 5 | 2 | 8 | 6 |
| 21-23 | All except Archer | Advantageous Position (Focus on Accuracy) | 10 | 3 | 5 | 2 | 8 | 6 |
| 24-26 | None | Carrying Voice (Focus on Spirit) | 8 | 6 | 1 | 1 | 9 | 10 |
| 31-33 | None | Child of Mana (Focus on Spirit) | 8 | 6 | 1 | 1 | 9 | 10 |
| 34-36 | None | Withstand Magic (Focus on Spirit) | 8 | 6 | 1 | 1 | 9 | 10 |
| 41-43 | None | Recluse's Caretaker (General Wizard) | 8 | 7 | 2 | 2 | 9 | 9 |
| 44-46 | None | Met with Fairies (General Wizard) | 8 | 7 | 2 | 2 | 9 | 9 |
| 51-53 | None | Learning in the Temple (General Wizard) | 8 | 7 | 2 | 2 | 9 | 9 |
| 54-56 | Archer | Wizard's Apprentice (Pure Wizardry) | 6 | 4 | 1 | 1 | 11 | 9 |
| 61-63 | Archer | Met Daemon (Pure Wizardry) | 6 | 4 | 1 | 1 | 11 | 9 |
| 64-66 | Archer | Thirst for Knowledge (Pure Wizardry) | 6 | 4 | 1 | 1 | 11 | 9 |

### Nightmare — Magic Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-14 | None | Gushing Mana (Accuracy + Magic Power) | 10 | 3 | 4 | 2 | 9 | 6 |
| 15-22 | None | Magic Through Weapons (Accuracy + Magic Power) | 10 | 3 | 4 | 2 | 9 | 6 |
| 23-26 | None | Touched by Magic Items (Accuracy + Magic Power) | 10 | 3 | 4 | 2 | 9 | 6 |
| 31-34 | None | Magician's Child (Balance) | 5 | 9 | 3 | 3 | 8 | 8 |
| 35-42 | None | Wunderkind (Balance) | 5 | 9 | 3 | 3 | 8 | 8 |
| 43-46 | None | Learn at Your Own Pace (Balance) | 5 | 9 | 3 | 3 | 8 | 8 |
| 51-54 | Spellpuncher, **Sworder, Artificer | Magical Accident (Focus on Durability) | 7 | 3 | 5 | 5 | 5 | 9 |
| 55-62 | Spellpuncher, **Sworder, Artificer | With Patience (Focus on Durability) | 7 | 3 | 5 | 5 | 5 | 9 |
| 63-66 | Spellpuncher, **Sworder, Artificer | Healing Injuries (Focus on Durability) | 7 | 3 | 5 | 5 | 5 | 9 |

Note: "**Sworder" refers to Magic Sworder, Leafblade, Daemonblade, etc. — Types using the Fencer class.

---

## Lykant (p. 84)

Only Warrior and Spy exist for Lykant — confirmed against the rendered page image (both tables
fit on a single page, no Remote Support or Magic Warrior table follows).

### Lykant — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-12 | None | Chase the Carriage (Focus on Accuracy) | 6 | 8 | 7 | 7 | 7 | 1 |
| 13-14 | None | To the Other Part (Focus on Accuracy) | 6 | 8 | 7 | 7 | 7 | 1 |
| 15-16 | None | Opening Eyes to the Truth (Focus on Accuracy) | 6 | 8 | 7 | 7 | 7 | 1 |
| 21-22 | None | Pet Dog (Balance) | 4 | 8 | 7 | 7 | 8 | 3 |
| 23-24 | None | Handyman (Balance) | 4 | 8 | 7 | 7 | 8 | 3 |
| 25-26 | None | Exemplary (Balance) | 4 | 8 | 7 | 7 | 8 | 3 |
| 31-32 | None | Garbage Scavenging (Generic Search) | 4 | 7 | 7 | 8 | 8 | 3 |
| 33-34 | None | Superior Senses (Generic Search) | 4 | 7 | 7 | 8 | 8 | 3 |
| 35-36 | None | Monster Hut (Generic Search) | 4 | 7 | 7 | 8 | 8 | 3 |
| 41-42 | None | Farm (Focus on Evasion) | 4 | 9 | 7 | 7 | 7 | 2 |
| 43-44 | None | Dancer (Focus on Evasion) | 4 | 9 | 7 | 7 | 7 | 2 |
| 45-46 | None | Suspected Criminal (Focus on Evasion) | 4 | 9 | 7 | 7 | 7 | 2 |
| 51-52 | Sworder | Brat (Focus on Striking) | 2 | 8 | 10 | 7 | 8 | 2 |
| 53-54 | Sworder | Defeated Adult (Focus on Striking) | 2 | 8 | 10 | 7 | 8 | 2 |
| 55-56 | Sworder | Wild Animal (Focus on Striking) | 2 | 8 | 10 | 7 | 8 | 2 |
| 61-62 | Sworder, Boxer | Carrier (Focus on Durability) | 2 | 5 | 9 | 10 | 7 | 4 |
| 63-64 | Sworder, Boxer | Slave (Focus on Durability) | 2 | 5 | 9 | 10 | 7 | 4 |
| 65-66 | Sworder, Boxer | Iron Ball (Focus on Durability) | 2 | 5 | 9 | 10 | 7 | 4 |

Note: the deprecated type "Sworder" also includes "Dragoon (Fencer)".

### Lykant — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Bold and Forceful (Combat Oriented) | 6 | 6 | 6 | 7 | 10 | 1 |
| 15-22 | Didn't Want to be Week (Combat Oriented) | 6 | 6 | 6 | 7 | 10 | 1 |
| 23-26 | Very Careful (Combat Oriented) | 6 | 6 | 6 | 7 | 10 | 1 |
| 31-34 | Plains Hunter (General Purpose) | 6 | 6 | 5 | 6 | 11 | 2 |
| 35-42 | Hunter's Smell (General Purpose) | 6 | 6 | 5 | 6 | 11 | 2 |
| 43-46 | Merchant (General Purpose) | 6 | 6 | 5 | 6 | 11 | 2 |
| 51-54 | Alert (Search Oriented) | 5 | 6 | 5 | 5 | 12 | 3 |
| 55-62 | Garbage Scavenging (Search Oriented) | 5 | 6 | 5 | 5 | 12 | 3 |
| 63-66 | Sixth Sense (Search Oriented) | 5 | 6 | 5 | 5 | 12 | 3 |

"Didn't Want to be Week" is printed exactly that way in the book (almost certainly means
"Weak"); transcribed as printed, not silently corrected.

---

## Lildraken (p. 85)

Only Warrior and Magic Warrior exist for Lildraken — confirmed against the rendered page image.

### Lildraken — Warrior Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-13 | Thug (Focus on Striking) | 4 | 7 | 10 | 12 | 1 | 6 |
| 14-16 | Big Body (Focus on Striking) | 4 | 7 | 10 | 12 | 1 | 6 |
| 21-23 | The Joy of Fighting (Focus on Striking) | 4 | 7 | 10 | 12 | 1 | 6 |
| 24-26 | Sky Hunter (Focus on Accuracy) | 6 | 6 | 9 | 15 | 1 | 3 |
| 31-33 | Chef's Apprentice (Focus on Accuracy) | 6 | 6 | 9 | 15 | 1 | 3 |
| 34-36 | Took Care of the Hatchery (Focus on Accuracy) | 6 | 6 | 9 | 15 | 1 | 3 |
| 41-43 | Suffered Epidemic (Focus on Durability) | 3 | 7 | 7 | 16 | 1 | 7 |
| 44-46 | Settlement Destroyed (Focus on Durability) | 3 | 7 | 7 | 16 | 1 | 7 |
| 51-53 | Exceptional Physical Toughness (Focus on Durability) | 3 | 7 | 7 | 16 | 1 | 7 |
| 54-56 | Growing Up with a Merchant (Generic Search) | 5 | 7 | 5 | 13 | 6 | 3 |
| 61-63 | Pharmacist's Apprentice (Generic Search) | 5 | 7 | 5 | 13 | 6 | 3 |
| 64-66 | Spirit of Enquiry (Generic Search) | 5 | 7 | 5 | 13 | 6 | 3 |

### Lildraken — Magic Warrior Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Hunter Qualities (Accuracy + Magic Power) | 6 | 3 | 6 | 10 | 6 | 7 |
| 15-22 | Search for Taste (Accuracy + Magic Power) | 6 | 3 | 6 | 10 | 6 | 7 |
| 23-26 | Self-Sufficiency (Accuracy + Magic Power) | 6 | 3 | 6 | 10 | 6 | 7 |
| 31-34 | Dragon Senses (Balance) | 5 | 7 | 7 | 10 | 5 | 6 |
| 35-42 | Broad Curiosity (Balance) | 5 | 7 | 7 | 10 | 5 | 6 |
| 43-46 | Outstanding Talent (Balance) | 5 | 7 | 7 | 10 | 5 | 6 |
| 51-54 | Felt God's Deliverance (Focus on Durability) | 4 | 3 | 7 | 16 | 2 | 8 |
| 55-62 | Nature's Whispers (Focus on Durability) | 4 | 3 | 7 | 16 | 2 | 8 |
| 63-66 | Fascinated with Daemons (Focus on Durability) | 4 | 3 | 7 | 16 | 2 | 8 |

---

## Grassrunner (p. 86)

Warrior, Spy, and a D6 Remote Support — no Magic Warrior. Warrior table's row-to-range mapping
is confirmed against the rendered page image (the raw text layer scrambled row order badly).

### Grassrunner — Warrior Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-13 | Letters to High Windows (Focus on Accuracy) | 10 | 8 | 4 | 13 | 1 | 10 |
| 14-16 | Lasso Master (Focus on Accuracy) | 10 | 8 | 4 | 13 | 1 | 10 |
| 21-23 | Windows-Broking Kid (Focus on Accuracy) | 10 | 8 | 4 | 13 | 1 | 10 |
| 24-26 | Evil Elite (Balance) | 7 | 7 | 4 | 13 | 3 | 13 |
| 31-33 | Crowded Town (Balance) | 7 | 7 | 4 | 13 | 3 | 13 |
| 34-36 | Overflowing Sense of Style (Balance) | 7 | 7 | 4 | 13 | 3 | 13 |
| 41-43 | For Profit (Generic Search) | 10 | 7 | 4 | 11 | 3 | 11 |
| 44-46 | Sharp Instincts (Generic Search) | 10 | 7 | 4 | 11 | 3 | 11 |
| 51-53 | Quick-Witted (Generic Search) | 10 | 7 | 4 | 11 | 3 | 11 |
| 54-56 | Messenger (Focus on Evasion) | 7 | 10 | 4 | 13 | 1 | 11 |
| 61-63 | Carrier (Focus on Evasion) | 7 | 10 | 4 | 13 | 1 | 11 |
| 64-66 | Escape Master (Focus on Evasion) | 7 | 10 | 4 | 13 | 1 | 11 |

### Grassrunner — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | In Charge (Combat Oriented) | 11 | 5 | 3 | 12 | 3 | 10 |
| 15-22 | Monster Hunter (Combat Oriented) | 11 | 5 | 3 | 12 | 3 | 10 |
| 23-26 | Guard (Combat Oriented) | 11 | 5 | 3 | 12 | 3 | 10 |
| 31-34 | Learner (General Purpose) | 7 | 7 | 3 | 11 | 6 | 12 |
| 35-42 | Traveling Alone (General Purpose) | 7 | 7 | 3 | 11 | 6 | 12 |
| 43-46 | Wariness (General Purpose) | 7 | 7 | 3 | 11 | 6 | 12 |
| 51-54 | Antiquarianism (Search Oriented) | 10 | 5 | 3 | 11 | 6 | 10 |
| 55-62 | Tracker (Search Oriented) | 10 | 5 | 3 | 11 | 6 | 10 |
| 63-66 | Explorer (Search Oriented) | 10 | 5 | 3 | 11 | 6 | 10 |

### Grassrunner — Remote Support Category (D6)

Genuinely a D6 table — confirmed against the rendered page image.

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 1 | Minstrel | Gambler (Focus on Accuracy) | 10 | 3 | 5 | 13 | 2 | 13 |
| 2 | Minstrel | Sniper of Love (Focus on Accuracy) | 10 | 3 | 5 | 13 | 2 | 13 |
| 3 | Minstrel | Hunter (Focus on Accuracy) | 10 | 3 | 5 | 13 | 2 | 13 |
| 4 | None | Music Lover (Focus on Spirit) | 6 | 4 | 2 | 12 | 3 | 17 |
| 5 | None | Adversity (Focus on Spirit) | 6 | 4 | 2 | 12 | 3 | 17 |
| 6 | None | Dreamer (Focus on Spirit) | 6 | 4 | 2 | 12 | 3 | 17 |

---

## Meria (p. 86–87)

Only Remote Support (D66) and Magic Warrior (D6) exist for Meria — no Warrior or Spy table.

### Meria — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | In Search of Nuts (Focus on Accuracy) | 6 | 1 | 5 | 14 | 2 | 2 |
| 14-16 | All except Archer | Actor (Focus on Accuracy) | 6 | 1 | 5 | 14 | 2 | 2 |
| 21-23 | All except Archer | Close to Investors (Focus on Accuracy) | 6 | 1 | 5 | 14 | 2 | 2 |
| 24-26 | None | Voice of the Earth (Focus on Spirit) | 5 | 1 | 1 | 14 | 3 | 6 |
| 31-33 | None | Main MC (Focus on Spirit) | 5 | 1 | 1 | 14 | 3 | 6 |
| 34-36 | None | Breathtaking Beauty (Focus on Spirit) | 5 | 1 | 1 | 14 | 3 | 6 |
| 41-43 | None | Magical Education (General Wizard) | 4 | 3 | 1 | 12 | 5 | 5 |
| 44-46 | None | Voices from the Graves (General Wizard) | 4 | 3 | 1 | 12 | 5 | 5 |
| 51-53 | None | Guild Employee (General Wizard) | 4 | 3 | 1 | 12 | 5 | 5 |
| 54-56 | Archer | Huge Library (Pure Wizardry) | 1 | 1 | 1 | 14 | 6 | 6 |
| 61-63 | Archer | Blossoming Cherry (Pure Wizardry) | 1 | 1 | 1 | 14 | 6 | 6 |
| 64-66 | Archer | Sacred Tree Staff (Pure Wizardry) | 1 | 1 | 1 | 14 | 6 | 6 |

### Meria — Magic Warrior Category (D6)

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 1 | Hustle and Bustle of the City (Accuracy + Magic Power) | 6 | 2 | 2 | 12 | 5 | 3 |
| 2 | Underwater (Accuracy + Magic Power) | 6 | 2 | 2 | 12 | 5 | 3 |
| 3 | Deep in Ruins (Accuracy + Magic Power) | 6 | 2 | 2 | 12 | 5 | 3 |
| 4 | Under the Tree (Balance) | 2 | 2 | 4 | 11 | 6 | 4 |
| 5 | Intense Study (Balance) | 2 | 2 | 4 | 11 | 6 | 4 |
| 6 | Nature's Colors (Balance) | 2 | 2 | 4 | 11 | 6 | 4 |

---

## Tiens (p. 88)

Only Warrior and Magic Warrior exist for Tiens. The Magic Warrior table's raw text layer
stacks all nine roll ranges together before the experience list; the pairing below is
confirmed against the rendered page image.

### Tiens — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-12 | None | Wall Archer (Focus on Accuracy) | 10 | 8 | 5 | 6 | 3 | 8 |
| 13-14 | None | Craftsmanship Qualities (Focus on Accuracy) | 10 | 8 | 5 | 6 | 3 | 8 |
| 15-16 | None | Battles Were Everyday (Focus on Accuracy) | 10 | 8 | 5 | 6 | 3 | 8 |
| 21-22 | None | The Mountains and Fields as Your Garden (Balance) | 8 | 8 | 5 | 8 | 4 | 7 |
| 23-24 | None | Mercenary Upbringing (Balance) | 8 | 8 | 5 | 8 | 4 | 7 |
| 25-26 | None | Child Prodigy (Balance) | 8 | 8 | 5 | 8 | 4 | 7 |
| 31-32 | None | From the Slums (Generic Search) | 7 | 7 | 5 | 6 | 6 | 10 |
| 33-34 | None | Lost in the Shallow (Generic Search) | 7 | 7 | 5 | 6 | 6 | 10 |
| 35-36 | None | Ambush Training (Generic Search) | 7 | 7 | 5 | 6 | 6 | 10 |
| 41-42 | None | Runaway Kid (Focus on Evasion) | 7 | 10 | 4 | 7 | 3 | 8 |
| 43-44 | None | Unyielding (Focus on Evasion) | 7 | 10 | 4 | 7 | 3 | 8 |
| 45-46 | None | Always Hit (Focus on Evasion) | 7 | 10 | 4 | 7 | 3 | 8 |
| 51-52 | None | Hard Work (Focus on Striking) | 8 | 8 | 6 | 8 | 3 | 6 |
| 53-54 | None | Mastered Secret Strike (Focus on Striking) | 8 | 8 | 6 | 8 | 3 | 6 |
| 55-56 | None | Art of War (Focus on Striking) | 8 | 8 | 6 | 8 | 3 | 6 |
| 61-62 | Boxer | Harsh Environment (Focus on Durability) | 7 | 7 | 5 | 9 | 3 | 8 |
| 63-64 | Boxer | Endured Training (Focus on Durability) | 7 | 7 | 5 | 9 | 3 | 8 |
| 65-66 | Boxer | Returned Back from the Brink of Death (Focus on Durability) | 7 | 7 | 5 | 9 | 3 | 8 |

### Tiens — Magic Warrior Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Defeated Daemon (Accuracy + Magic Power) | 11 | 3 | 1 | 4 | 9 | 10 |
| 15-22 | Heir of the Vagrants (Accuracy + Magic Power) | 11 | 3 | 1 | 4 | 9 | 10 |
| 23-26 | Enemy Control (Accuracy + Magic Power) | 11 | 3 | 1 | 4 | 9 | 10 |
| 31-34 | One With Nature (Balance) | 8 | 8 | 3 | 6 | 7 | 10 |
| 35-42 | Saved by the Vagrants (Balance) | 8 | 8 | 3 | 6 | 7 | 10 |
| 43-46 | Learned in Battle (Balance) | 8 | 8 | 3 | 6 | 7 | 10 |
| 51-54 | Survived Solitude (Focus on Durability) | 4 | 4 | 5 | 9 | 7 | 10 |
| 55-62 | Mind of the Beast (Focus on Durability) | 4 | 4 | 5 | 9 | 7 | 10 |
| 63-66 | Returned Back from the Brink of Death (Focus on Durability) | 4 | 4 | 5 | 9 | 7 | 10 |

---

## Leprechaun (p. 88–89)

Spy, Remote Support, and a D6 Magic Warrior — no Warrior table.

### Leprechaun — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Had to Fight (Combat Oriented) | 9 | 4 | 8 | 8 | 7 | 2 |
| 15-22 | From House to House (Combat Oriented) | 9 | 4 | 8 | 8 | 7 | 2 |
| 23-26 | Longing to be a Hero (Combat Oriented) | 9 | 4 | 8 | 8 | 7 | 2 |
| 31-34 | Jack of all Trades (General Purpose) | 7 | 4 | 8 | 8 | 7 | 4 |
| 35-42 | Wiping Butts (General Purpose) | 7 | 4 | 8 | 8 | 7 | 4 |
| 43-46 | Wandering Teacher (General Purpose) | 7 | 4 | 8 | 8 | 7 | 4 |
| 51-54 | Secret Help (Search Oriented) | 7 | 4 | 6 | 7 | 9 | 5 |
| 55-62 | Too Keen (Search Oriented) | 7 | 4 | 6 | 7 | 9 | 5 |
| 63-66 | "Scary" (Search Oriented) | 7 | 4 | 6 | 7 | 9 | 5 |

### Leprechaun — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Hunting was a Way of Life (Focus on Accuracy) | 12 | 1 | 2 | 2 | 7 | 6 |
| 14-16 | All except Archer | Battles Were Everyday (Focus on Accuracy) | 12 | 1 | 2 | 2 | 7 | 6 |
| 21-23 | All except Archer | Sneaky Help (Focus on Accuracy) | 12 | 1 | 2 | 2 | 7 | 6 |
| 24-26 | None | Longed to be a Bard (Focus on Spirit) | 4 | 1 | 2 | 4 | 7 | 12 |
| 31-33 | None | Adorable (Focus on Spirit) | 4 | 1 | 2 | 4 | 7 | 12 |
| 34-36 | None | Withstood Magic (Focus on Spirit) | 4 | 1 | 2 | 4 | 7 | 12 |
| 41-43 | None | Learned in Secret (General Wizard) | 7 | 3 | 4 | 5 | 10 | 9 |
| 44-46 | None | Nature was the Teacher (General Wizard) | 7 | 3 | 4 | 5 | 10 | 9 |
| 51-53 | None | Daemon Appeared (General Wizard) | 7 | 3 | 4 | 5 | 10 | 9 |
| 54-56 | Archer | Magic in Nature (Pure Wizardry) | 2 | 1 | 2 | 2 | 12 | 10 |
| 61-63 | Archer | Wizard's Apprentice (Pure Wizardry) | 2 | 1 | 2 | 2 | 12 | 10 |
| 64-66 | Archer | Helped Wizard (Pure Wizardry) | 2 | 1 | 2 | 2 | 12 | 10 |

### Leprechaun — Magic Warrior Category (D6)

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 1 | Inherited Power (Accuracy + Magic Power) | 11 | 1 | 4 | 4 | 8 | 7 |
| 2 | Prepared for Battle (Accuracy + Magic Power) | 11 | 1 | 4 | 4 | 8 | 7 |
| 3 | Weapon in Hand (Accuracy + Magic Power) | 11 | 1 | 4 | 4 | 8 | 7 |
| 4 | Retired Adventurer's Home (Balance) | 6 | 5 | 6 | 5 | 7 | 9 |
| 5 | Traveled with Vagrants (Balance) | 6 | 5 | 6 | 5 | 7 | 9 |
| 6 | Secret Friend (Balance) | 6 | 5 | 6 | 5 | 7 | 9 |

---

## Alv (p. 90–91)

All 4 categories present (Magic Warrior is D6).

### Alv — Warrior Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-13 | Self-Sufficient (Focus on Accuracy) | 6 | 6 | 9 | 7 | 9 | 3 |
| 14-16 | Manual Labor (Focus on Accuracy) | 6 | 6 | 9 | 7 | 9 | 3 |
| 21-23 | With Criminals (Focus on Accuracy) | 6 | 6 | 9 | 7 | 9 | 3 |
| 24-26 | In Mountains and Fields (Balance) | 4 | 8 | 10 | 7 | 8 | 3 |
| 31-33 | Cultural Living (Balance) | 4 | 8 | 10 | 7 | 8 | 3 |
| 34-36 | Outstanding Talent (Balance) | 4 | 8 | 10 | 7 | 8 | 3 |
| 41-43 | Vigilant (Generic Search) | 5 | 7 | 9 | 6 | 10 | 2 |
| 44-46 | Never Missed a Chance (Generic Search) | 5 | 7 | 9 | 6 | 10 | 2 |
| 51-53 | Persecuted (Generic Search) | 5 | 7 | 9 | 6 | 10 | 2 |
| 54-56 | In Hiding (Focus on Evasion) | 4 | 9 | 9 | 8 | 7 | 2 |
| 61-63 | Didn't Want To Hurt (Focus on Evasion) | 4 | 9 | 9 | 8 | 7 | 2 |
| 64-66 | Lightweight (Focus on Evasion) | 4 | 9 | 9 | 8 | 7 | 2 |

### Alv — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Had to Fight (Combat Oriented) | 6 | 9 | 7 | 5 | 9 | 2 |
| 15-22 | Showed Strength (Combat Oriented) | 6 | 9 | 7 | 5 | 9 | 2 |
| 23-26 | Terrifying (Combat Oriented) | 6 | 9 | 7 | 5 | 9 | 2 |
| 31-34 | Finished Quietly (General Purpose) | 5 | 8 | 8 | 6 | 10 | 2 |
| 35-42 | Jack Of All Trades (General Purpose) | 5 | 8 | 8 | 6 | 10 | 2 |
| 43-46 | Prepared for Everything (General Purpose) | 5 | 8 | 8 | 6 | 10 | 2 |
| 51-54 | Seeing Through People (Search Oriented) | 6 | 7 | 7 | 5 | 11 | 2 |
| 55-62 | Looking for a Place to Hide (Search Oriented) | 6 | 7 | 7 | 5 | 11 | 2 |
| 63-66 | Crime Life (Search Oriented) | 6 | 7 | 7 | 5 | 11 | 2 |

### Alv — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Learned to Hunt (Focus on Accuracy) | 6 | 4 | 9 | 7 | 9 | 4 |
| 14-16 | All except Archer | Eyes on the Target (Focus on Accuracy) | 6 | 4 | 9 | 7 | 9 | 4 |
| 21-23 | All except Archer | Archer's House (Focus on Accuracy) | 6 | 4 | 9 | 7 | 9 | 4 |
| 24-26 | None | Calm Mind (Focus on Spirit) | 3 | 5 | 7 | 7 | 11 | 6 |
| 31-33 | None | Beautiful Voice (Focus on Spirit) | 3 | 5 | 7 | 7 | 11 | 6 |
| 34-36 | None | Excellent Pitch (Focus on Spirit) | 3 | 5 | 7 | 7 | 11 | 6 |
| 41-43 | None | Nights at Wizard's House (General Wizard) | 4 | 6 | 8 | 6 | 11 | 4 |
| 44-46 | None | Time in Woods (General Wizard) | 4 | 6 | 8 | 6 | 11 | 4 |
| 51-53 | None | In The Temple (General Wizard) | 4 | 6 | 8 | 6 | 11 | 4 |
| 54-56 | Archer | Wizard's Apprentice (Pure Wizardry) | 1 | 5 | 9 | 7 | 12 | 5 |
| 61-63 | Archer | Learning from Nature (Pure Wizardry) | 1 | 5 | 9 | 7 | 12 | 5 |
| 64-66 | Archer | Heard Daemons (Pure Wizardry) | 1 | 5 | 9 | 7 | 12 | 5 |

### Alv — Magic Warrior Category (D6)

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 1 | Touched Magitech (Accuracy + Magic Power) | 6 | 5 | 8 | 7 | 10 | 3 |
| 2 | Felt Magic Rising (Accuracy + Magic Power) | 6 | 5 | 8 | 7 | 10 | 3 |
| 3 | Weapon And Magic (Accuracy + Magic Power) | 6 | 5 | 8 | 7 | 10 | 3 |
| 4 | Raised to be Magic Warrior (Balance) | 5 | 8 | 10 | 7 | 8 | 3 |
| 5 | Outstanding Talent (Balance) | 5 | 8 | 10 | 7 | 8 | 3 |
| 6 | Daemon's Guidance in the Darkness (Balance) | 5 | 8 | 10 | 7 | 8 | 3 |

---

## Weakling (p. 92–93)

The book's own "Life Segments" header on this race's page is mislabeled "Alv Life Segments"
(literal copy-paste leftover, confirmed against the rendered page image) — a genuine book
error, not a transcription mistake here; not otherwise relevant to the mechanical data below.
Weakling also gets a small extra table not part of the Childhood Experience system proper
(race-of-origin ability bump + weak point: Garuda/Tannoz/Basilisk/Minotaur), not transcribed
here as it's a different mechanic from the d66 tables this doc covers.

### Weakling — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-12 | None | Cutter (Focus on Accuracy) | 11 | 6 | 6 | 7 | 4† | 4 |
| 13-14 | None | Trickster (Focus on Accuracy) | 11 | 6 | 6 | 7 | 4† | 4 |
| 15-16 | None | Raider (Focus on Accuracy) | 11 | 6 | 6 | 7 | 4† | 4 |
| 21-22 | None | Training Target (Balance) | 8 | 8 | 7 | 7 | 6 | 6 |
| 23-24 | None | Lucky (Balance) | 8 | 8 | 7 | 7 | 6 | 6 |
| 25-26 | None | Careful (Balance) | 8 | 8 | 7 | 7 | 6 | 6 |
| 31-32 | None | Collector (Generic Search) | 8 | 8 | 7 | 7 | 8 | 4 |
| 33-34 | None | Avoiding Traps in Ruins (Generic Search) | 8 | 8 | 7 | 7 | 8 | 4 |
| 35-36 | None | Acute Senses (Generic Search) | 8 | 8 | 7 | 7 | 8 | 4 |
| 41-42 | None | Decoy (Focus on Evasion) | 7 | 11 | 6 | 6 | 4 | 4 |
| 43-44 | None | First (Focus on Evasion) | 7 | 11 | 6 | 6 | 4 | 4 |
| 45-46 | None | Fast (Focus on Evasion) | 7 | 11 | 6 | 6 | 4 | 4 |
| 51-52 | Boxer | Hit and Down (Focus on Striking) | 8 | 6 | 10 | 7 | 5 | 5 |
| 53-54 | Boxer | Blessed Body (Focus on Striking) | 8 | 6 | 10 | 7 | 5 | 5 |
| 55-56 | Boxer | Days of Physical Labor (Focus on Striking) | 8 | 6 | 10 | 7 | 5 | 5 |
| 61-62 | Sworder, Boxer | Harsh Environment (Focus on Durability) | 7 | 4 | 8 | 10 | 4 | 8 |
| 63-64 | Sworder, Boxer | Amusing Tool (Focus on Durability) | 7 | 4 | 8 | 10 | 4 | 8 |
| 65-66 | Sworder, Boxer | With Death At Close Hand (Focus on Durability) | 7 | 4 | 8 | 10 | 4 | 8 |

† Book anomaly, confirmed against the rendered page image: rows 11-16 print "A11 B6 C6 D7 C4
F4" — the fifth value is labeled **C4**, a repeat of the third column's letter, where every
other row in the book runs strictly A-B-C-D-E-F. Almost certainly meant to be **E4**;
transcribed above as the value 4 in the E column with the mislabel flagged, not silently fixed.

Note: the deprecated type "Sworder" also includes "Dragoon (Fencer)".

### Weakling — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | First To Attack (Combat Oriented) | 9 | 8 | 7 | 6 | 7 | 5 |
| 15-22 | Safety (Combat Oriented) | 9 | 8 | 7 | 6 | 7 | 5 |
| 23-26 | Fighting as Last Resort (Combat Oriented) | 9 | 8 | 7 | 6 | 7 | 5 |
| 31-34 | Adapted to Everything (General Purpose) | 8 | 8 | 6 | 6 | 8 | 6 |
| 35-42 | All-Round (General Purpose) | 8 | 8 | 6 | 6 | 8 | 6 |
| 43-46 | Discreet Life (General Purpose) | 8 | 8 | 6 | 6 | 8 | 6 |
| 51-54 | Excellent Intuition (Search Oriented) | 9 | 8 | 6 | 6 | 9 | 4 |
| 55-62 | Quick Understanding (Search Oriented) | 9 | 8 | 6 | 6 | 9 | 4 |
| 63-66 | Out of Danger (Search Oriented) | 9 | 8 | 6 | 6 | 9 | 4 |

### Weakling — Remote Support Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | All except Archer | Hunting Life (Focus on Accuracy) | 11 | 4 | 6 | 5 | 7 | 5 |
| 14-16 | All except Archer | Learned Ranged Weapons (Focus on Accuracy) | 11 | 4 | 6 | 5 | 7 | 5 |
| 21-23 | All except Archer | Keep Away (Focus on Accuracy) | 11 | 4 | 6 | 5 | 7 | 5 |
| 24-26 | None | Uniquely Beautiful Voice (Focus on Spirit) | 5 | 5 | 6 | 6 | 9 | 10 |
| 31-33 | None | Strong Will (Focus on Spirit) | 5 | 5 | 6 | 6 | 9 | 10 |
| 34-36 | None | Plentiful Mana (Focus on Spirit) | 5 | 5 | 6 | 6 | 9 | 10 |
| 41-43 | None | Wizard's Servant (General Wizard) | 4 | 6 | 6 | 6 | 10 | 9 |
| 44-46 | None | Nature Was Your Teacher (General Wizard) | 4 | 6 | 6 | 6 | 10 | 9 |
| 51-53 | None | Growing up in a Temple (General Wizard) | 4 | 6 | 6 | 6 | 10 | 9 |
| 54-56 | Archer | Wizard's Apprentice (Pure Wizardry) | 4 | 4 | 4 | 4 | 11 | 10 |
| 61-63 | Archer | Heard Daemon's Voice (Pure Wizardry) | 4 | 4 | 4 | 4 | 11 | 10 |
| 64-66 | Archer | Played With by Fairies (Pure Wizardry) | 4 | 4 | 4 | 4 | 11 | 10 |

### Weakling — Magic Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-14 | None | Mana Growing (Accuracy + Magic Power) | 10 | 6 | 5 | 6 | 9 | 5 |
| 15-22 | None | Magical Talents (Accuracy + Magic Power) | 10 | 6 | 5 | 6 | 9 | 5 |
| 23-26 | None | Voice of Greatness (Accuracy + Magic Power) | 10 | 6 | 5 | 6 | 9 | 5 |
| 31-34 | None | Gifted Education (Balance) | 7 | 7 | 7 | 7 | 7 | 7 |
| 35-42 | None | Talented (Balance) | 7 | 7 | 7 | 7 | 7 | 7 |
| 43-46 | None | Learning from Nature (Balance) | 7 | 7 | 7 | 7 | 7 | 7 |
| 51-54 | Spellpuncher, **Sworder, Artificer | Harsh Environment (Focus on Durability) | 5 | 5 | 7 | 10 | 7 | 7 |
| 55-62 | Spellpuncher, **Sworder, Artificer | Subject (Focus on Durability) | 5 | 5 | 7 | 10 | 7 | 7 |
| 63-66 | Spellpuncher, **Sworder, Artificer | Recovery Magic (Focus on Durability) | 5 | 5 | 7 | 10 | 7 | 7 |

Note: "**Sworder" refers to Magic Sworder, Leafblade, Daemonblade, etc. — Types using the Fencer class.

---

## Shadow (p. 94)

Only Warrior and Spy exist for Shadow — confirmed against the rendered page image (Soleil's
header begins right after Spy ends, same page).

### Shadow — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-12 | None | Sharp Eyes (Focus on Accuracy) | 6 | 4 | 8 | 8 | 3 | 4 |
| 13-14 | None | Familiar with Arms (Focus on Accuracy) | 6 | 4 | 8 | 8 | 3 | 4 |
| 15-16 | None | Tinkerer (Focus on Accuracy) | 6 | 4 | 8 | 8 | 3 | 4 |
| 21-22 | None | Mountain Run (Balance) | 4 | 5 | 7 | 8 | 5 | 5 |
| 23-24 | None | Training School (Balance) | 4 | 5 | 7 | 8 | 5 | 5 |
| 25-26 | None | Natural Gift (Balance) | 4 | 5 | 7 | 8 | 5 | 5 |
| 31-32 | None | Keen Insight (Generic Search) | 4 | 4 | 6 | 6 | 9 | 5 |
| 33-34 | None | Hunter's Child (Generic Search) | 4 | 4 | 6 | 6 | 9 | 5 |
| 35-36 | None | Child of War (Generic Search) | 4 | 4 | 6 | 6 | 9 | 5 |
| 41-42 | None | Daily Running (Focus on Evasion) | 4 | 6 | 8 | 7 | 4 | 4 |
| 43-44 | None | Exquisite Footwork (Focus on Evasion) | 4 | 6 | 8 | 7 | 4 | 4 |
| 45-46 | None | Messenger (Focus on Evasion) | 4 | 6 | 8 | 7 | 4 | 4 |
| 51-52 | Boxer | Striker (Focus on Striking) | 4 | 4 | 10 | 6 | 4 | 5 |
| 53-54 | Boxer | Strong (Focus on Striking) | 4 | 4 | 10 | 6 | 4 | 5 |
| 55-56 | Boxer | Worked Out (Focus on Striking) | 4 | 4 | 10 | 6 | 4 | 5 |
| 61-62 | Sworder, Boxer | Hellish Environment (Focus on Durability) | 3 | 4 | 8 | 10 | 4 | 5 |
| 63-64 | Sworder, Boxer | Abundant Food (Focus on Durability) | 3 | 4 | 8 | 10 | 4 | 5 |
| 65-66 | Sworder, Boxer | Death Was Everywhere (Focus on Durability) | 3 | 4 | 8 | 10 | 4 | 5 |

Note: the deprecated type "Sworder" also includes "Dragoon (Fencer)".

### Shadow — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Not Afraid to Fight (Combat Oriented) | 5 | 4 | 8 | 7 | 7 | 3 |
| 15-22 | Silent Assassin (Combat Oriented) | 5 | 4 | 8 | 7 | 7 | 3 |
| 23-26 | Prepared for Fight (Combat Oriented) | 5 | 4 | 8 | 7 | 7 | 3 |
| 31-34 | Versatile (General Purpose) | 4 | 5 | 5 | 6 | 8 | 6 |
| 35-42 | Jack of All Trades (General Purpose) | 4 | 5 | 5 | 6 | 8 | 6 |
| 43-46 | Saw Hole Picture (General Purpose) | 4 | 5 | 5 | 6 | 8 | 6 |
| 51-54 | Discerning (Search Oriented) | 5 | 5 | 4 | 5 | 10 | 4 |
| 55-62 | Fast Fingers (Search Oriented) | 5 | 5 | 4 | 5 | 10 | 4 |
| 63-66 | Hidden (Search Oriented) | 5 | 5 | 4 | 5 | 10 | 4 |

---

## Soleil (p. 95)

Only Warrior and Spy exist for Soleil — this is also where the entire pp. 74–95 Childhood
Experience Tables section ends (page 95's footer is the last page of the section).

### Soleil — Warrior Category

| Roll | Deprecated | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| 11-13 | None | Natural-born Hunter (Focus on Accuracy) | 6 | 6 | 10 | 7 | 2 | 5 |
| 14-16 | None | Artisan (Focus on Accuracy) | 6 | 6 | 10 | 7 | 2 | 5 |
| 21-23 | None | Herb Student (Focus on Accuracy) | 6 | 6 | 10 | 7 | 2 | 5 |
| 24-26 | None | Feral Child (Balance) | 3 | 7 | 9 | 8 | 4 | 6 |
| 31-33 | None | Chief's Guidance (Balance) | 3 | 7 | 9 | 8 | 4 | 6 |
| 34-36 | None | Physically Gifted (Balance) | 3 | 7 | 9 | 8 | 4 | 6 |
| 41-43 | None | Wind Caller (Focus on Evasion) | 3 | 11 | 8 | 7 | 2 | 4 |
| 44-46 | None | Untouchable (Focus on Evasion) | 3 | 11 | 8 | 7 | 2 | 4 |
| 51-53 | None | Rising Star (Focus on Evasion) | 3 | 11 | 8 | 7 | 2 | 4 |
| 54-56 | Sworder | Undefeated (Focus on Striking) | 4 | 6 | 12 | 7 | 1 | 6 |
| 61-63 | Sworder | Strength is Everything (Focus on Striking) | 4 | 6 | 12 | 7 | 1 | 6 |
| 64-66 | Sworder | Striker (Focus on Striking) | 4 | 6 | 12 | 7 | 1 | 6 |

Note: the deprecated type "Sworder" also includes "Dragoon (Fencer)".

### Soleil — Spy Category

(No Deprecated column.)

| Roll | Experience (Focus) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| 11-14 | Winner (Combat Oriented) | 4 | 7 | 10 | 7 | 4 | 4 |
| 15-22 | Quick (Combat Oriented) | 4 | 7 | 10 | 7 | 4 | 4 |
| 23-26 | Second Plan (Combat Oriented) | 4 | 7 | 10 | 7 | 4 | 4 |
| 31-34 | Game (General Purpose) | 4 | 7 | 8 | 6 | 5 | 7 |
| 35-42 | Learning Outcome (General Purpose) | 4 | 7 | 8 | 6 | 5 | 7 |
| 43-46 | Wiping Butts (General Purpose) | 4 | 7 | 8 | 6 | 5 | 7 |
| 51-54 | Increased Attention Span (Search Oriented) | 4 | 8 | 9 | 5 | 6 | 4 |
| 55-62 | Trap Horror (Search Oriented) | 4 | 8 | 9 | 5 | 6 | 4 |
| 63-66 | Sharp Senses (Search Oriented) | 4 | 8 | 9 | 5 | 6 | 4 |

---

## What's on the sheet vs. what isn't

Nothing about this is implemented yet in `src/data/` as of this write-up — this document is
the research/transcription pass only, matching the pattern already established for other
optional systems in this repo (e.g. `docs/sheet-content/19-work-skills.md` before the catalog
file existed). A future implementation should treat each row here as index data (roll range,
deprecated type, experience name, focus tag, six correction numbers) — no explanation prose to
carry over, matching every other catalog in this repo.

## Totals and anomalies (for sanity-checking later)

**46 tables, 501 rows total** — not the 56 tables originally assumed (14 races × 4 categories).
Per-race table counts and row counts:

| Race | Tables | Rows |
|---|---|---|
| Human | 4 | 48 |
| Elven | 4 | 39 |
| Dwarven | 3 | 33 |
| Tabbit | 1 | 9 |
| Runefolk | 4 | 42 |
| Nightmare | 4 | 48 |
| Lykant | 2 | 27 |
| Lildraken | 2 | 21 |
| Grassrunner | 3 | 27 |
| Meria | 2 | 18 |
| Tiens | 2 | 27 |
| Leprechaun | 3 | 27 |
| Alv | 4 | 39 |
| Weakling | 4 | 48 |
| Shadow | 2 | 27 |
| Soleil | 2 | 21 |
| **Total** | **46** | **501** |

Anomalies found, in the order encountered:

1. **Category count is not uniform across races.** Dwarven has no Spy table. Tabbit has only
   one table total (Remote Support). Lykant, Lildraken, Shadow, and Soleil each have exactly 2
   categories. Grassrunner and Leprechaun each have 3. Meria has 2. Only Human, Elven, Runefolk,
   Nightmare, Alv, and Weakling get the full 4. Every one of these gaps was confirmed against a
   rendered page image, not just inferred from `pdftotext` silence, since a missing table could
   just as easily have been a text-layer drop (as genuinely happened elsewhere in this project's
   PDF work per `state.md`). It wasn't: the page images show these races' sections simply ending
   after fewer tables, with the next race's banner header starting immediately after.
2. **Five tables are D6, not D66**, despite living inside a document about d66 tables: Elven
   Magic Warrior, Grassrunner Remote Support, Meria Magic Warrior, Leprechaun Magic Warrior, Alv
   Magic Warrior. All five run exactly 6 rows (rolls 1–6) with one Experience per roll, no
   ranges. Confirmed against rendered images for Elven and Grassrunner; the other three follow
   the identical "6 rows, one experience per row, no deprecated column" shape so plausibly the
   same, and their raw `pdftotext` output showed no scrambling to raise doubt.
3. **Two book typos, not extraction errors** — both confirmed against the rendered page image
   before concluding "the book is wrong" rather than "the text layer is wrong":
   - Human Remote Support, rows 54-56/61-63/64-66 (Wizard's Apprentice / Learned about Daemons /
     Thirst for Knowledge): printed as "A3 B3 C3 D7 E11 E10" — the F column is labeled **E**
     again instead of F. Recorded above as F=10 with the mislabel flagged.
   - Weakling Warrior, rows 11-12/13-14/15-16 (Cutter / Trickster / Raider): printed as
     "A11 B6 C6 D7 C4 F4" — the E column is labeled **C** again instead of E. Recorded above as
     E=4 with the mislabel flagged.
   - Also cosmetic: the Weakling race page's Life Segments table header literally reads "Alv
     Life Segments" (leftover from copy-pasting the previous race's page template) — harmless,
     noted for completeness only.
4. **Two tables required page-image rendering to safely reconstruct row order**, because
   `pdftotext -layout`'s reading order broke down on tables where a cell's content spanned more
   print-lines than its neighbors (rows visually drifted apart from their roll-range labels):
   Nightmare Warrior (pp. 82) and Grassrunner Warrior (p. 86). Runefolk's Remote Support and
   Magic Warrior tables (p. 81) had a different failure mode — Explanation-column prose
   interleaved character-by-character with the Ability Score Correction digits — decoded by
   inspection and then cross-checked against the render; the numbers matched exactly.
5. One name is printed oddly but was left as-is rather than "corrected": Lykant Spy, row 15-22,
   "Didn't Want to be Week" (almost certainly means "Weak").
