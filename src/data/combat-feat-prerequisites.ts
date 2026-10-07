/**
 * Acquisition prerequisites ("Prer.") of the selectively acquired Combat Feats of Core
 * Rulebook I–III, read from the feat data pages (CR I pp. 250–265, CR II pp. 198–211,
 * CR III pp. 199–205). A feat's requirements are ALL of the entries listed ("AND"); inside
 * one entry the alternatives are the entry's own (several classes sharing one level).
 *
 * The supplements' feats follow the core ones: Magus Arts (pp. 22, 34, read from the PDF with
 * the two columns told apart by eye), the Outlaw Profile Book (the table in
 * docs/sheet-content/22-vagrant-misc.md) and Tyrants Crypts' grimoire chain (as the feats' own
 * effect text states it). Battle Mastery's only selectively acquired feat, [Quick Cast], has
 * "Prer. None". A feat missing from this table is simply not checked, never reported as failing.
 *
 * A requirement on another feat names it the way the book does. "Cover I" means that feat or
 * any higher numeral of it (a [Cover II] replaces [Cover I] on the sheet); a bare "Cover"
 * means either; a name ending in "/" is a family ("Metamagic/" = any [Metamagic/**]).
 */
export type FeatRequirement =
  | { kind: 'adventurerLevel'; level: number }
  /** One level threshold met by any of these classes. */
  | { kind: 'classLevel'; classIds: string[]; level: number }
  /** `count` different Wizard-type classes, each at `level` or higher. */
  | { kind: 'wizardClasses'; count: number; level: number }
  | { kind: 'feat'; name: string };

const adv = (level: number): FeatRequirement => ({ kind: 'adventurerLevel', level });
const cls = (level: number, ...classIds: string[]): FeatRequirement => ({ kind: 'classLevel', classIds, level });
const wiz = (count: number, level: number): FeatRequirement => ({ kind: 'wizardClasses', count, level });
const feat = (name: string): FeatRequirement => ({ kind: 'feat', name });

/** Keyed by the feat's catalog name. A feat with "Prer. None" is simply absent. */
export const COMBAT_FEAT_PREREQUISITES: Record<string, FeatRequirement[]> = {
  // --- Core Rulebook I ---
  'Guardian I': [adv(5), feat('Cover')],
  'Evasive Maneuvers I': [adv(3)],
  Tenacity: [cls(5, 'fighter', 'grappler', 'fencer')],
  'Twin Strike': [feat('Dual Wielding')],
  'Hawk Eye': [feat('Targeting')],
  'Improved Throw I': [cls(3, 'grappler')],
  'Dual Technique': [adv(5)],
  'Weapon Proficiency S': [feat('Weapon Proficiency A'), adv(5)],
  Stomp: [cls(5, 'grappler')],
  'Ever-Changing I': [cls(5, 'grappler', 'fencer')],
  'Armor Proficiency S': [feat('Armor Proficiency A'), adv(5)],
  'Metamagic Master': [feat('Universal Metamagic')],
  'MP Save': [adv(5)],
  'Infight I': [cls(5, 'grappler')],
  'Cleave I': [cls(3, 'fighter')],
  'Universal Metamagic': [feat('Metamagic/')],
  'Magic Control': [feat('Targeting'), feat('Magic Convergence')],
  'Multi-Action': [adv(5)],

  // --- Core Rulebook II ---
  Footwork: [adv(9)],
  'Guardian II': [feat('Guardian I'), adv(9)],
  'Evasive Maneuvers II': [feat('Evasive Maneuvers I'), cls(9, 'fencer')],
  "Archer's Grace": [cls(7, 'marksman')],
  'Intense Finale': [cls(3, 'bard')],
  'Additional Songs I': [cls(1, 'bard')],
  'Additional Songs II': [feat('Additional Songs I'), cls(7, 'bard')],
  'Throwing II': [feat('Throwing I'), adv(5)],
  'Super Tenacity': [cls(7, 'fighter', 'grappler'), feat('Tenacity')],
  'Special Instrument Proficiency': [cls(1, 'bard')],
  'Flying Kick': [cls(9, 'grappler')],
  'Improved Throw II': [feat('Improved Throw I'), cls(9, 'grappler')],
  Harmony: [cls(5, 'bard')],
  Block: [adv(3)],
  'Mako Stones Master': [adv(9)],
  Marionette: [adv(5)],
  'Powerful Magic I': [wiz(2, 6)],
  'Pinpoint Attack I': [adv(7)],
  'Muscle Mystery': [cls(5, 'enhancer')],
  'Infight II': [feat('Infight I'), cls(9, 'grappler')],
  'Decoy Attack II': [feat('Decoy Attack I'), adv(9)],
  'Rhythm Conversion': [cls(3, 'bard')],
  'Mirage Arrow': [cls(9, 'marksman')],
  'Cover II': [feat('Cover I'), adv(7)],
  'Nerve Strike': [cls(9, 'grappler')],
  'Repeated Strike II': [feat('Repeated Strike I'), cls(7, 'fencer', 'fighter')],
  'Critical Cast I': [adv(7)],
  'Aimed Attack II': [feat('Aimed Attack I'), adv(7)],
  'Confident Performer': [cls(3, 'bard')],
  'Skillful Play': [cls(7, 'bard')],
  'Power Strike II': [feat('Power Strike I'), cls(9, 'fighter', 'grappler')],
  'Double Cast': [wiz(1, 9)],
  'Taunting Strike II': [feat('Taunting Strike I'), cls(7, 'fencer')],
  'Tail Swing I': [adv(3)],
  'Tail Swing II': [feat('Tail Swing I'), adv(9)],
  'Cleave II': [feat('Cleave I'), cls(9, 'fighter')],
  'Lethal Strike II': [feat('Lethal Strike I'), adv(7)],
  'Armor Piercer II': [feat('Armor Piercer I'), cls(9, 'grappler')],

  // --- Core Rulebook III ---
  Capacity: [adv(11)],
  'Additional Songs III': [feat('Additional Songs II'), adv(13)],
  'Peerless Double Swords': [adv(11)],
  'Weapon Master': [feat('Weapon Proficiency S'), adv(11)],
  'Enhanced Evocations I': [cls(3, 'alchemist')],
  'Enhanced Evocations II': [feat('Enhanced Evocations I'), cls(9, 'alchemist')],
  'Distant Evocations': [cls(5, 'alchemist')],
  'Ever-Changing II': [feat('Ever-Changing I'), cls(13, 'grappler', 'fencer')],
  'Armor Master': [feat('Armor Proficiency S'), adv(11)],
  'Powerful Magic II': [feat('Powerful Magic I'), adv(11), wiz(2, 10)],
  'Pinpoint Attack II': [feat('Pinpoint Attack I'), adv(13)],
  'Consecutive Evocation': [cls(5, 'alchemist')],
  'Card Reduction': [cls(5, 'alchemist')],
  'Aimed Attack III': [feat('Aimed Attack II'), adv(11)],
  'Critical Cast II': [feat('Critical Cast I'), adv(11)],
  'Power Strike III': [feat('Power Strike II'), cls(15, 'fighter')],
  'Violentcast II': [feat('Violentcast I'), adv(13)],
  'Lethal Strike III': [feat('Lethal Strike II'), cls(11, 'fencer')],
  'Armor Piercer III': [feat('Armor Piercer II'), cls(15, 'grappler')],

  // --- Magus Arts ---
  'Spreading Triad': [cls(1, 'geomancer')],
  'Dividing Triad': [cls(3, 'geomancer')],
  'Frontline Mastermind': [cls(5, 'tactician')],
  'Additional Stratagem/Maneuver I': [cls(1, 'tactician')],
  'Additional Stratagem/Maneuver II': [feat('Additional Stratagem/Maneuver I'), cls(5, 'tactician')],
  'Additional Stratagem/Maneuver III': [feat('Additional Stratagem/Maneuver II'), cls(9, 'tactician')],
  Versatile: [cls(9, 'tactician')],

  // --- Outlaw Profile Book (Vagrant Combat Feats, pp. 138-141) ---
  'Follow-Up': [feat('Shield Bash')],
  'Enhanced Resistance I': [adv(3)],
  'Enhanced Resistance II': [feat('Enhanced Resistance I'), adv(11)],
  'Cheat Cast II': [feat('Cheat Cast I'), adv(13)],
  'Shield Bash II': [feat('Shield Bash I'), adv(5)],
  'Shadow Step II': [feat('Shadow Step I'), adv(7)],
  'Desperate Strike II': [feat('Desperate Strike I'), adv(7)],
  'Desperate Strike III': [feat('Desperate Strike II'), adv(15)],
  'Wild Strike II': [feat('Wild Strike I'), adv(7)],

  // --- Tyrants Crypts (fan wiki) ---
  'Grimoire Proficiency S': [feat('Grimoire Proficiency A'), cls(5, 'bibliomancer')],
  'Grimoire Mastery': [feat('Grimoire Proficiency S'), cls(11, 'bibliomancer')],
};

/**
 * The feats a character may pick at creation (CR I p. 77 — "you can choose only one of the
 * combat feats from the list below"). Every other selectively acquired feat has to wait for
 * a later learning slot.
 */
export const CREATION_COMBAT_FEATS: string[] = [
  'Dodge',
  'Targeting',
  'Weapon Proficiency A',
  'Armor Proficiency A',
  'Dual Wielding',
  'Decoy Attack I',
  'Cover I',
  'Repeated Strike I',
  'Aimed Attack I',
  'Power Strike I',
  'Taunting Strike I',
  'Defensive Stance',
  'Violentcast I',
  'Lethal Strike I',
  'Metamagic/Power Assurance',
  'Metamagic/Accuracy',
  'Metamagic/Targets',
  'Metamagic/Distance',
  'Metamagic/Time',
  'Metamagic/Area',
  'Magic Convergence',
  'Mana Strike',
  'Armor Piercer I',
  'Snipe',
  'Wordbreak',
];

/** What the free Battle Dancer feat of level 1 may be (Battle Mastery p. 12). */
export const BATTLE_DANCER_BONUS_FEATS: string[] = [
  'Decoy Attack I',
  'Repeated Strike I',
  'Aimed Attack I',
  'Power Strike I',
  'Taunting Strike I',
  'Lethal Strike I',
  'Mana Strike',
];
