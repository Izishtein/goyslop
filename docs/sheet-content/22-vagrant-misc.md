# Vagrant — Adolescent Experience, Equipment by Type, Combat Feats, 4th Level/Level Up (§ 3 optional system)

Source: **Outlaw Profile Book** (SW2.5 Supplement), pp. 98–101, 104–105 (briefly 116–121), 122, 138–141.
Read from `pdftotext -layout` for pp. 98–101/112–122, which came out clean; pp. 104–105 and
138–141 were cross-checked against rendered page images (`scripts/render-pdf-pages.mjs`) because
both are dense narrow-column tables of exactly the kind `state.md`'s pdf-parsing grabli warns
about. One real misread was caught this way: p. 105's Sniper/Remote Support rows collapsed two
side-by-side rows into one garbled line in the text layer (e.g. "Sniper, Bow"/"Sniper, Crossbow"
looked merged with stray "None" filler cells) — the rendered image gave the true 8 separate rows.
p. 104's rows matched the text layer exactly, so only p. 105 needed correction.

This is one of three parallel research passes on the book's Vagrant optional character-creation
system; the 17 Category/Type templates (pp. 34–57) and the 56 Childhood Experience tables
(pp. 74–95) are covered elsewhere and not repeated here.

---

## 1. Adolescent Experience Tables (pp. 98–101)

A d6 roll, on one of several small tables selected by the "Focus" tag the character got from its
earlier Childhood Experience result and by its Category/Type group. Each result grants a specific
known Combat Feat, printed as e.g. "[Power Strike I]/[Desperate Strike I]" — the player picks
**one** of the two (or more), not both — with a page reference into the book's Combat Feat Data
(p. 132–141: 132–133 is Core I data reprinted for reference, 139–141 is this book's own Vagrant
feats, see § 3 below). Explanation/flavor-text columns are skipped per this project's usual
convention (mechanical/index data only).

**10 tables, 52 rows total** (pp. 98–100; the Column sidebar "About Vagrant Combat Feats" that
follows on pp. 100–101 is prose, not a table — see the note at the end of § 1).

### Hunter, Alchemy Warrior, Dragoon Fighter Types (Focus on Striking)

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1 | Aiming for the Strongest Strike | [Power Strike I]/[Desperate Strike I] | 133/139 |
| 2 | Mastering the Finishing Blow | [Power Strike I]/[Desperate Strike I] | 133/139 |
| 3 | Repeat Until You Hit It | [Repeated Strike I]/[Wild Strike I] | 133/139 |
| 4 | Learning Best Skills | [Repeated Strike I]/[Wild Strike I] | 133/139 |
| 5 | Spent time as a Soldier | [Weapon Proficiency A/**] | 132 |
| 6 | Fateful Encounter | [Weapon Proficiency A/**] | 132 |

### Hunter, Alchemy Warrior, Dragoon Fighter/Fencer Types (Focus on Accuracy/Balance/Focus on Evasion/Generic Search)

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1 | Learned to Kill with One Hit | [Power Strike I]/[Desperate Strike I] | 133/139 |
| 2 | Never Missed an Opening | [Lethal Strike I]/[Herald Strike] | 133/139 |
| 3 | Trump Card | [Aimed Attack I]/[Shield Bash I] | 133/139 |
| 4 | Deception | [Decoy Attack I]/[Wild Strike I] | 133/139 |
| 5 | Bodywork | [Armor Proficiency A/**]/[Shadow Step I] | 132/139 |
| 6 | Fateful Encounter | [Weapon Proficiency A/**] | 132 |

### Hunter, Alchemy Warrior, Dragoon Fencer Types (Focus on Durability)

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1 | Overwhelming Presence | [Taunting Strike I] | 133 |
| 2 | Always at your Best | [Power Strike I]/[Shield Bash I] | 133/139 |
| 3 | Dedicated | [Cover I] | 133 |
| 4 | Suffered While Covering | [Cover I] | 133 |
| 5 | Trained to be a Knight/Warrior | [Armor Proficiency A/**] | 132 |
| 6 | Worked at an Armorsmith | [Armor Proficiency A/**] | 132 |

### Commando, Tracker Types (General Purpose, Generic Search)

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1 | Support | [Decoy Attack I] | 133 |
| 2 | Disturbing | [Decoy Attack I]/[Wild Strike I] | 133/139 |
| 3 | Believed in Friends | [Decoy Attack I]/[Shadow Step I] | 133/139 |
| 4 | Believed in Survival | [Defensive Stance]/[Shadow Step I] | 133/139 |
| 5 | Counterattack | [Defensive Stance]/[Shadow Step I] | 133/139 |
| 6 | True-to-life Performance | [Taunting Strike I]/[Wild Strike I] | 133/139 |

### Commando, Tracker Types (Combat Oriented)

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1 | Keen Eyes | [Lethal Strike I]/[Herald Strike] | 133/139 |
| 2 | Was On the Ball | [Lethal Strike I]/[Desperate Strike I] | 133/139 |
| 3 | Means to Victory | [Weapon Proficiency A/**]/[Shadow Step I] | 132/139 |
| 4 | Formally Trained | [Weapon Proficiency A/**] | 132 |
| 5 | Master Provocateur | [Taunting Strike I]/[Wild Strike I] | 133/139 |
| 6 | Combat Slap | [Taunting Strike I]/[Shield Bash I] | 133/139 |

Table footnote: "If you have learned the Grappler class, you can change to [Armor Piercer I]
(see p. 133)." — printed once after this table, not tied to a single row.

### Sniper, Alchemist, Beastmaster (Subclass is Marksman) Types

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1–3 | Hard Work | [Targeting] | 133 |
| 4–6 | Sharpened Senses | [Targeting] | 133 |

### Wizard, Beastmaster (Subclass is Sorcerer) Types

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1–2 | Training and Concentration | [Targeting] | 133 |
| 3–4 | Saw Magic Traces | [Targeting] | 133 |
| 5 | No Mana Waster | [Targeting]/[Quick Cast] | 133/139 |
| 6 | Overcome Resistance | [Targeting]/[Cheat Cast I] | 133/139 |

### Fairy Priest, Druid, Daemonologist, Beastmaster (Subclass is Conjurer, Druid or Daemonologist) Types

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1–2 | Clear View | [Metamagic/Targets] | 133 |
| 3–4 | Training and Perseverance | [Metamagic/Targets] | 133 |
| 5 | To Those in Need | [Metamagic/Targets]/[Quick Cast] | 133/139 |
| 6 | Persistence and Repetition | [Metamagic/Targets]/[Cheat Cast I] | 133/139 |

### Spellpuncher, Grove Defender, Summoning Warrior, Leafblade, Daemonblade Types (Accuracy + Magic Power/Balance)

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1 | Weaving Spells | [Mana Strike] | 133 |
| 2 | Magical Emanation | [Mana Strike] | 133 |
| 3 | Against the Horde | [Metamagic/Targets]/[Quick Cast] | 133/139 |
| 4 | For my Friends | [Metamagic/Targets]/[Quick Cast] | 133/139 |
| 5 | Magic with Martial Arts | [Weapon Proficiency A/**] | 132 |
| 6 | The Keystone of the Battlefield | [Armor Proficiency A/**] | 132 |

### Grove Defender, Summoning Warrior Types (Focus on Durability)

| D6 | Experience | Combat Feat | Ref. |
|---|---|---|---|
| 1 | Dedicated | [Cover I] | 133 |
| 2 | Suffered While Covering | [Cover I] | 133 |
| 3 | Against the Horde | [Metamagic/Targets]/[Quick Cast] | 133/139 |
| 4 | For my Friends | [Metamagic/Targets]/[Quick Cast] | 133/139 |
| 5 | Body as a Fortress | [Armor Proficiency A/**] | 132 |
| 6 | The Keystone of the Battlefield | [Armor Proficiency A/**] | 132 |

**Out of scope, same pages:** p. 99 also carries four small D66 "Acquisition Table" boxes
(Technique, Stunt, Spellsongs/Finales, Evocation) that hand out non-combat-feat rewards (a
Technique, a Rider Stunt, a Spellsong/Finale, an Alchemist Evocation) — a different reward type
from the Combat Feat tables above, so not transcribed here; flag if the app ever needs that data.

**Column: "About Vagrant Combat Feats" (pp. 100–101).** A prose sidebar, not a table, explaining
in plain language what each Vagrant-only feat referenced above actually does and who it suits:
[Desperate Strike I] (Extra Damage +5, 5 self-damage — risky for low-VIT races), [Herald Strike]
(fixed Accuracy check 5, +1 Power Roll — good for high-DEX races, guarantees a hit against
fixed-value minions), [Wild Strike I] (hits 3 targets, one Accuracy check, -2 penalty),
[Shield Bash I] (+2 Accuracy, can knock prone, loses shield's own Defense/Evasion while used as a
weapon — mentions [Follow-Up] as a future feat that lets the other hand finish off a downed
target), [Shadow Step I] (reroll an Evasion check, or +2 melee damage — good for low-Defense
Fencers/Grapplers), [Quick Cast] (halves MP for "Resistance: Negated" spells; lists example spells
per class it suits — Sorcerer [Dull Weapon]/[Nap], Conjurer [Dark Mist]/[Fanaticism]/[Earth Heal],
Priest [Banish]/[Cure Wounds], Fairy Tamer [Snare], Druid [Bad Steam], none for Daemonologist),
[Cheat Cast I] (Success Value +2 on repeating a spell already cast in the same combat). All are
called out as "Active Combat Feat" (this project's `declaration` category). This sidebar overlaps
with, and is superseded in mechanical precision by, the full stat-block catalog in § 3 below.

---

## 2. Equipment by Type (pp. 104–105)

**Shape:** a fixed itemized starting-gear table, but not one row per Type — each Type (or group of
Types sharing the same kit) gets several variant rows keyed by a build name (Standard/Low
Cost/Power/Accuracy/Durability/etc.) crossed with a Min STR threshold, each specifying exact
Weapon/Armor/Shield/Belongings/Money. A separate small table right after it, "Item Packs for
Specific Classes," adds accessory packs (implements, holy symbols, instruments, etc.) keyed by
**class name**, not Type — this is how the pure-caster Types (Wizard, Fairy Priest, Druid,
Daemonologist, Beastmaster-as-caster) get their starting gear, since they don't appear as their
own rows in the main table (their `Primary class` is what carries the pack, e.g. "Sorcerer",
"Conjurer", "Priest", "Fairy Tamer", "Artificer", "Druid", "Daemonologist"). Types that never need
a weapon/armor loadout of their own (Sage, Bard, Enhancer, Rider, Alchemist) show up only in the
Item Packs table too, with `None` or a themed pack (Musical Instrument, Mount Contract, Alchemy
Kit + Material Cards).

### Main Equipment by Type table (p. 104, corrected p. 105 rows per the image-render note above)

| Type | Min STR | Primary class | Weapon | Armor | Shield | Belonging 1 | Belonging 2 | Money (G) |
|---|---|---|---|---|---|---|---|---|
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Standard 10 | 10 | Fighter | Saber, p. 164 | Soft Leather, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 560 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Low Cost 10 | 10 | Fighter | Short Spear, p. 165 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | None | 780 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Power 10 | 10 | Fighter | Flail, p. 166 | Soft Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 610 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Accuracy 10 | 10 | Fighter | Heavy Mallet, p. 166 | Soft Leather, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 530 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Standard 13 | 13 | Fighter | Saber, p. 164 | Hard Leather, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 370 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Low Cost 13 | 13 | Fighter | Short Spear, p. 165 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | None | 780 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Power 13 | 13 | Fighter | Long Sword, p. 164 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | None | 320 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Accuracy 13 | 13 | Fighter | Heavy Mallet, p. 166 | Hard Leather, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 340 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Standard 17 | 17 | Fighter | Broad Sword, p. 164 | Hard Leather, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | None | 320 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Low Cost 17 | 17 | Fighter | Spear, p. 165 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | None | 590 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Power 17 | 17 | Fighter | Bastard Sword, p. 164 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | None | 200 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Accuracy 17 | 17 | Fighter | Heavy Mace, p. 166 | Hard Leather, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 230 |
| Alchemy Warrior, Dragoon Fighter, Durability 17 | 17 | Fighter | Heavy Mace, p. 166 | Splint Armor, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | None | 150 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, One Shot 20 | 20 | Fighter | Zweihander, p. 164 | Cloth Armor, p. 170 | None | Adventurer Set, p. 171 | None | 225 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Standard 20 | 20 | Fighter | Heavy Axe, p. 165 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | None | 320 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Low Cost 20 | 20 | Fighter | Long Spear, p. 165 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | None | 540 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Power 20 | 20 | Fighter | Mattock, p. 166 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | None | 320 |
| Hunter, Alchemy Warrior, Dragoon Fighter, Commando Fighter, Accuracy 20 | 20 | Fighter | Maul, p. 166 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | None | 320 |
| Alchemy Warrior, Dragoon Fighter, Durability 20 | 20 | Fighter | Light Mace, p. 166 | Chainmail, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | None | 120 |
| Grove Defender, Standard 7 | 7 | Fighter | Quarterstaff, p. 166 | Soft Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 710 |
| Grove Defender, Standard 11 | 11 | Fighter | Oak Staff, p. 166 | Soft Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 640 |
| Grove Defender, Armored 13 | 13 | Fighter | Oak Staff, p. 166 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 450 |
| Grove Defender, Metal Armored 15 (Gains penalty for spells) | 15 | Fighter | Oak Staff, p. 166 | Splint Armor, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 270 |
| Summoning Warrior, Standard 7 | 7 | Fighter | Katzbalger, p. 164 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 690 |
| Summoning Warrior, Standard 10 | 10 | Fighter | Saber, p. 164 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 600 |
| Summoning Warrior, Accuracy 10 | 10 | Fighter | Heavy Mallet, p. 166 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 570 |
| Summoning Warrior, Accuracy 15 | 15 | Fighter | Heavy Mace, p. 166 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 460 |
| Summoning Warrior, Low Cost/Power 20 | 20 | Fighter | Long Spear, p. 165 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 570 |
| Dragoon Fencer, Tracker, Leafblade, Daemonblade, Standard | 1 | Fencer | Knife, p. 164 | Cloth Armor, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 895 |
| Dragoon Fencer, Tracker, Leafblade, Daemonblade, Standard 9 | 9 | Fencer | Short Sword, p. 164 | Cloth Armor, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 845 |
| Dragoon Fencer, Tracker, Leafblade, Daemonblade, Standard 13 | 13 | Fencer | Katzbalger, p. 164 | Soft Leather, p. 170 | Buckler, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 690 |
| Commando Grappler, Spellpuncher, Standard 5 | 5 | Grappler | Iron Knuckles, p. 167, Solid Heels, p. 167, Throw, p. 167 | Point Guard, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 560 |
| Commando Grappler, Spellpuncher, Standard 10 | 10 | Grappler | Iron Boxers, p. 167, Solid Heels, p. 167, Throw, p. 167 | Point Guard, p. 170 | None | Adventurer Set, p. 171 | None | 530 |
| Sniper, Bow | 2 | Marksman | Short Bow, p. 168 | Cloth Armor, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 925 |
| Sniper, Crossbow | 1 | Marksman | Light Crossbow, p. 169 | Cloth Armor, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 825 |
| Sniper, Bow 7 | 7 | Marksman | Normal Bow, p. 168 | Soft Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 730 |
| Sniper, Crossbow 7 | 7 | Marksman | Normal Crossbow, p. 169 | Soft Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 590 |
| Sniper, Bow 13 | 13 | Marksman | Long Bow, p. 168 | Hard Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 490 |
| Sniper, Crossbow 13 | 13 | Marksman | Heavy Crossbow, p. 169 | Soft Leather, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 320 |
| Sniper (+ Artificer) | 1 | Marksman | Matchlock, p. 169 | Cloth Armor, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 625 |
| Sniper (+ Artificer) 5 | 5 | Marksman | Toradar, p. 169 | None | None | Adventurer Set, p. 171 | None | 300 |
| Remote Support Category 1 | 1 | Remote Support Category | None | Cloth Armor, p. 170 | None | Adventurer Set, p. 171 | Awake Potion, p. 172 | 985 |
| Remote Support Category 8 | 8 | Remote Support Category | None | Soft Leather, p. 170 | Round Shield, p. 170 | Adventurer Set, p. 171 | Awake Potion, p. 172 | 750 |

### Item Packs for Specific Classes (p. 105)

| Class | Item(s) | Entry (equip slot) | Price (G) | Notes |
|---|---|---|---|---|
| Marksman | Arrow Case p. 173, Quarrel p. 169 ×12 | Accessory: Back, Items in Possessions | 40 | For Crossbow |
| Marksman | Arrow Case p. 173, Arrow p. 169 ×12 | Accessory: Back, Items in Possessions | 30 | For Bow |
| Sorcerer | Magical Implement p. 173, Magic Herb p. 172 ×1 | 1H, 2H, Accessory: R/L Hand, Items in Possessions | 200 | Skip if already bought a Conjurer pack, or weapon is Mage Staff p. 166 (refund 100G) |
| Conjurer | Magical Implement p. 173, Magic Herb p. 172 ×1 | 1H, 2H, Accessory: R/L Hand, Items in Possessions | 200 | Skip if already bought a Sorcerer pack, or weapon is Mage Staff p. 166 (refund 100G) |
| Priest | Holy Symbol p. 173, Magic Herb p. 172 ×1 | Accessory: Any, Items in Possessions | 200 | — |
| Fairy Tamer | Fairy Tamer's Gem p. 173 ×4 | Accessory: Any | 200 | — |
| Artificer | Magisphere (Small) p. 173, Gun Belt p. 173, Bullet p. 169 ×12 | Accessory: Any/Back, Items in Possessions | 270 | — |
| Druid | Staff of the Sacred Tree p. 173, Magic Herb p. 172 ×1 | Weapon Column (1H), Items in Possessions | 200 | If equipped with a Staff-category weapon (p. 166), can be treated as Staff of the Sacred Tree for 100G instead |
| Daemonologist | Summoner's Emblem p. 173, Summoning Sacrifice p. 173 | Accessory: Any, Items in Possessions | 320 | 2× Zombie Eyes (1st Level Mengle) or 2× Bat Wings (2nd Level Imp) |
| Scout | Scout's Tools p. 173 | Items in Possessions | 100 | — |
| Ranger | Lifegrass p. 172 ×5, Magic Herb p. 172 ×1 | Items in Possessions | 250 | — |
| Sage | None | — | 0 | — |
| Bard | Musical Instrument p. 173 | Weapon Column (2H) | 100 | Both hands occupied when in use |
| Enhancer | Mako Stone (3 pts.) p. 173 | Items in Possessions | 300 | Skippable if money is scarce |
| Rider | Horse's Mount Contract p. 175 | Items in Possessions | 250 | — |
| Alchemist | Alchemy Kit p. 173, Material Card (B) p. 173 ×5 | Accessory: Waist, Items in Possessions | 300 | Card colour depends on the Evocation learned |

### Equipment by Type — 4th Level (pp. 116–121): skimmed, not transcribed

This is **materially different**, not just "the same items plus upgrades." It reorganizes into six
pages of separate tables per Min-STR bracket per Type-group (e.g. "Hunter, Alchemy Warrior,
Dragoon Fighter, Commando Fighter Types, Strength 10+/13+/17+/20+ Table", "Sniper, Alchemist,
Beastmaster Types, Strength +1/+7/+13 Table"), and each bracket now offers extra variant rows
gated behind a `Requirement` column — usually a specific [Weapon Proficiency A/**] or
[Armor Proficiency A/**] the character must already have — unlocking better gear (Kite Shield
instead of Buckler/Round Shield, Splint Armor instead of Soft/Hard Leather) plus a third Belonging
slot (Black Belt, p. 174, or Thermal Mantle, p. 174, depending on category). Money costs jump
roughly 3–10× (e.g. Standard 10 goes from 560G to 2,400G). Skipped full transcription: it is a
straightforward re-run of the same per-Type/STR grid at higher numbers and gated by feats already
modeled elsewhere, not new mechanics — flag if the app ever wants the exact 4th-level loadouts.

---

## 3. Vagrant Combat Feat Details (pp. 138–141)

Confirmed by the book's own section headers (matches `src/data/combat-feats.ts`'s
`CombatFeatCategory`: `passive` = book's "Selectively Acquired Passive", `declaration` = book's
"Selectively Acquired Active" — every one of these feats has an `Appl.`/`Risk` field and is
declared for a single use, none consumes a full Major Action so none is `majorAction` — `auto` =
book's "Automatically Acquired [Active/Passive]"). **18 feats total**, more than the 8 previously
logged in `state.md`; the additions found here are Shield Bash II, Shadow Step II, Wild Strike I,
Wild Strike II, Quick Cast, Plunder, and Crude Take.

### Selectively Acquired Passive (passive)

| Feat | Prereq | Use |
|---|---|---|
| Follow-Up | [Shield Bash] | 1H weapon |
| Enhanced Resistance I | Adventurer Level 3+ | — |
| Enhanced Resistance II | [Enhanced Resistance I] / Adventurer Level 11+ | — |

### Selectively Acquired Active (declaration)

| Feat | Prereq | Use |
|---|---|---|
| Cheat Cast I | None | Wizard-Type Classes |
| Cheat Cast II | [Cheat Cast I] / Adventurer Level 13+ | Wizard-Type Classes |
| Quick Cast | None | Wizard-Type Classes |
| Shield Bash I | None | Shield |
| Shield Bash II | [Shield Bash I] / Adventurer Level 5+ | Shield |
| Shadow Step I | None | — |
| Shadow Step II | [Shadow Step I] / Adventurer Level 7+ | — |
| Desperate Strike I | None | — |
| Desperate Strike II | [Desperate Strike I] / Adventurer Level 7+ | — |
| Desperate Strike III | [Desperate Strike II] / Adventurer Level 15+ | — |
| Herald Strike | None | — |
| Wild Strike I | None | 1H weapon |
| Wild Strike II | [Wild Strike I] / Adventurer Level 7+ | 1H weapon |

### Automatically Acquired (auto)

| Feat | Prereq / how it's granted | Book's own sub-label |
|---|---|---|
| Plunder | Scout or Ranger or Sage Class Level 5 — optional substitute for [Treasure Hunt] (Scout 5) | "Automatically Acquired Active Vagrant Combat Feats" |
| Crude Take | Scout or Ranger or Sage Class Level 5 — optional substitute for [Survivability] (Ranger 5) | "Automatically Acquired Passive Vagrant Combat Feats" |

Note: the book's intro (p. 138) lists **three** normal auto-feats eligible for a Vagrant
substitute — [Treasure Hunt] (Scout 5), [Survivability] (Ranger 5), and [Keen Eyes] (Sage 5) — and
its own worked example has a character keep [Keen Eyes] "as is" rather than replacing it. Only two
replacement feats (Plunder, Crude Take) are actually printed in pp. 138–141; there is no Vagrant
substitute for [Keen Eyes] in this book. Substitution is optional and, once taken, fixed (cannot
later swap back to the original or to a different substitute for that same slot).

**Cross-reference worth flagging:** `src/data/combat-feats.ts` currently sources `Quick Cast` to
"Battle Mastery p. 37" (category `declaration`). This book prints an identically-named, identically
`Appl./Risk`-shaped [Quick Cast] as a Vagrant feat on p. 139 ("halves MP for spells with
Resistance: Neg", Wizard-Type Classes) — the same effect text as Battle Mastery's. Whether this is
the same feat reprinted across two supplements, or two independently-named feats that happen to
collide, wasn't resolved here (out of scope for a research pass) — flagging so the catalog's
`sourceBook` field can be revisited if it matters.

---

## 4. 4th Level Character Creation (pp. 112–115) and Level Up Guideline (p. 122) — summary

Creating a 4th-level Vagrant is **not** a separate from-scratch procedure with its own tables: the
book has you run the normal 2nd-level creation (Steps 1–5, p. 18) and then apply a fixed "growth to
4th level" pass on top, deferring shopping until after that growth. Ability scores get one of two
fixed growth patterns (Growth A: +1 to five abilities; Growth B: +2 to one ability and +1 to three
others). Classes grow via a lookup: the character's Primary/Subclass combination sorts into "Group
A" (at least one of Primary/Subclass is Major) or "Group B" (both Minor), and each group has a
small numbered table of level combinations to pick from (e.g. Major Primary 4/Major Subclass 4, or
Major Primary 4/Minor Subclass 3 + newly-picked Minor Support 3) — not free-form leveling, and any
XP left over from initial creation is discarded in favor of a fixed "Remaining XP" the chosen
pattern grants instead. A single new Combat Feat is acquired for reaching adventurer level 3
(recommended picks are tabulated per Category on p. 113–114), and equipment is bought fresh from
the "Equipment by Type – 4th Level" tables (§ 2 above) rather than incrementally upgraded. The
Level Up Guideline (p. 122) is not Vagrant-specific at all: it explicitly defers the actual leveling
rules to Core Rulebook I p. 188 and gives ordinary GM-advice-style guidance for any character
(level up your most-used class first, keep secondary classes within ~2 levels of the primary, spend
early XP toward reaching level 3 for the next Combat Feat slot, and a short list of especially
strong feats to consider at level 5+: [Weapon/Armor Proficiency S/**], [MP Save/**],
[Multi-Action], [Tenacity]). So: 4th-level creation has its own guided mechanism (fixed growth
patterns, not free rolling), but ongoing leveling after that point is just standard SW2.5 leveling
with no Vagrant-only rules layered on.

---

## Summary

- **Adolescent Experience Tables:** 10 tables, 52 rows, all transcribed in § 1.
- **Vagrant Combat Feats:** 18 confirmed (3 passive, 13 declaration, 2 auto) — more than the 8
  previously logged in `state.md`; the delta is Shield Bash II, Shadow Step II, Wild Strike I/II,
  Quick Cast, Plunder, Crude Take.
- **Resolved by rendering a page image:** p. 105's Sniper/Remote Support rows (pdftotext had
  merged/misaligned two side-by-side rows); pp. 138–141 were also rendered to double-check the
  two-column Combat Feat catalog for dropped entries — none were found, the text layer there was
  accurate and the render only confirmed the section headers (Passive vs. Active vs. Automatically
  Acquired Active/Passive) used to assign categories above.
