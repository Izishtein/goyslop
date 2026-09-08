/**
 * Vagrant Adolescent Experience tables — Outlaw Profile Book pp. 98-101, transcribed in
 * docs/sheet-content/22-vagrant-misc.md § 1.
 *
 * A 1d6 roll on one of these tables grants a specific known Combat Feat. Which table applies is
 * keyed by the "Focus" tag the character got from its earlier Childhood Experience roll (see
 * `./childhood.ts`) together with its chosen Category/Type — not by race. When a row lists more
 * than one feat, the player picks one; feats printed in `[Brackets]` that also appear in
 * `../combat-feats.ts` under "Outlaw Profile Book" are this book's own Vagrant Combat Feats,
 * the rest are Core Rulebook I feats already in the main catalog.
 */

export interface AdolescentExperienceRow {
  roll: string;
  experience: string;
  /** One or more Combat Feat names as printed (with "[]"); the player picks one when there's more than one. */
  combatFeats: string[];
}

export interface AdolescentExperienceTable {
  id: string;
  /** Which Types/Category and Focus tag this table applies to, as printed. */
  label: string;
  rows: AdolescentExperienceRow[];
}

function row(roll: string, experience: string, ...combatFeats: string[]): AdolescentExperienceRow {
  return { roll, experience, combatFeats };
}

export const ADOLESCENT_EXPERIENCE_TABLES: AdolescentExperienceTable[] = [
  {
    id: 'warrior-striking',
    label: 'Hunter, Alchemy Warrior, Dragoon Fighter Types (Focus on Striking)',
    rows: [
      row('1', 'Aiming for the Strongest Strike', '[Power Strike I]', '[Desperate Strike I]'),
      row('2', 'Mastering the Finishing Blow', '[Power Strike I]', '[Desperate Strike I]'),
      row('3', 'Repeat Until You Hit It', '[Repeated Strike I]', '[Wild Strike I]'),
      row('4', 'Learning Best Skills', '[Repeated Strike I]', '[Wild Strike I]'),
      row('5', 'Spent time as a Soldier', '[Weapon Proficiency A/**]'),
      row('6', 'Fateful Encounter', '[Weapon Proficiency A/**]'),
    ],
  },
  {
    id: 'warrior-accuracy-balance-evasion-search',
    label: 'Hunter, Alchemy Warrior, Dragoon Fighter/Fencer Types (Focus on Accuracy/Balance/Focus on Evasion/Generic Search)',
    rows: [
      row('1', 'Learned to Kill with One Hit', '[Power Strike I]', '[Desperate Strike I]'),
      row('2', 'Never Missed an Opening', '[Lethal Strike I]', '[Herald Strike]'),
      row('3', 'Trump Card', '[Aimed Attack I]', '[Shield Bash I]'),
      row('4', 'Deception', '[Decoy Attack I]', '[Wild Strike I]'),
      row('5', 'Bodywork', '[Armor Proficiency A/**]', '[Shadow Step I]'),
      row('6', 'Fateful Encounter', '[Weapon Proficiency A/**]'),
    ],
  },
  {
    id: 'warrior-durability',
    label: 'Hunter, Alchemy Warrior, Dragoon Fencer Types (Focus on Durability)',
    rows: [
      row('1', 'Overwhelming Presence', '[Taunting Strike I]'),
      row('2', 'Always at your Best', '[Power Strike I]', '[Shield Bash I]'),
      row('3', 'Dedicated', '[Cover I]'),
      row('4', 'Suffered While Covering', '[Cover I]'),
      row('5', 'Trained to be a Knight/Warrior', '[Armor Proficiency A/**]'),
      row('6', 'Worked at an Armorsmith', '[Armor Proficiency A/**]'),
    ],
  },
  {
    id: 'spy-general-search',
    label: 'Commando, Tracker Types (General Purpose, Generic Search)',
    rows: [
      row('1', 'Support', '[Decoy Attack I]'),
      row('2', 'Disturbing', '[Decoy Attack I]', '[Wild Strike I]'),
      row('3', 'Believed in Friends', '[Decoy Attack I]', '[Shadow Step I]'),
      row('4', 'Believed in Survival', '[Defensive Stance]', '[Shadow Step I]'),
      row('5', 'Counterattack', '[Defensive Stance]', '[Shadow Step I]'),
      row('6', 'True-to-life Performance', '[Taunting Strike I]', '[Wild Strike I]'),
    ],
  },
  {
    id: 'spy-combat-oriented',
    label: 'Commando, Tracker Types (Combat Oriented)',
    rows: [
      row('1', 'Keen Eyes', '[Lethal Strike I]', '[Herald Strike]'),
      row('2', 'Was On the Ball', '[Lethal Strike I]', '[Desperate Strike I]'),
      row('3', 'Means to Victory', '[Weapon Proficiency A/**]', '[Shadow Step I]'),
      row('4', 'Formally Trained', '[Weapon Proficiency A/**]'),
      row('5', 'Master Provocateur', '[Taunting Strike I]', '[Wild Strike I]'),
      row('6', 'Combat Slap', '[Taunting Strike I]', '[Shield Bash I]'),
    ],
  },
  {
    id: 'sniper-marksman-subclass',
    label: 'Sniper, Alchemist, Beastmaster (Subclass is Marksman) Types',
    rows: [
      row('1-3', 'Hard Work', '[Targeting]'),
      row('4-6', 'Sharpened Senses', '[Targeting]'),
    ],
  },
  {
    id: 'wizard-sorcerer-subclass',
    label: 'Wizard, Beastmaster (Subclass is Sorcerer) Types',
    rows: [
      row('1-2', 'Training and Concentration', '[Targeting]'),
      row('3-4', 'Saw Magic Traces', '[Targeting]'),
      row('5', 'No Mana Waster', '[Targeting]', '[Quick Cast]'),
      row('6', 'Overcome Resistance', '[Targeting]', '[Cheat Cast I]'),
    ],
  },
  {
    id: 'remote-support-caster-subclass',
    label: 'Fairy Priest, Druid, Daemonologist, Beastmaster (Subclass is Conjurer, Druid or Daemonologist) Types',
    rows: [
      row('1-2', 'Clear View', '[Metamagic/Targets]'),
      row('3-4', 'Training and Perseverance', '[Metamagic/Targets]'),
      row('5', 'To Those in Need', '[Metamagic/Targets]', '[Quick Cast]'),
      row('6', 'Persistence and Repetition', '[Metamagic/Targets]', '[Cheat Cast I]'),
    ],
  },
  {
    id: 'magic-warrior-accuracy-magicpower-balance',
    label: 'Spellpuncher, Grove Defender, Summoning Warrior, Leafblade, Daemonblade Types (Accuracy + Magic Power/Balance)',
    rows: [
      row('1', 'Weaving Spells', '[Mana Strike]'),
      row('2', 'Magical Emanation', '[Mana Strike]'),
      row('3', 'Against the Horde', '[Metamagic/Targets]', '[Quick Cast]'),
      row('4', 'For my Friends', '[Metamagic/Targets]', '[Quick Cast]'),
      row('5', 'Magic with Martial Arts', '[Weapon Proficiency A/**]'),
      row('6', 'The Keystone of the Battlefield', '[Armor Proficiency A/**]'),
    ],
  },
  {
    id: 'magic-warrior-durability',
    label: 'Grove Defender, Summoning Warrior Types (Focus on Durability)',
    rows: [
      row('1', 'Dedicated', '[Cover I]'),
      row('2', 'Suffered While Covering', '[Cover I]'),
      row('3', 'Against the Horde', '[Metamagic/Targets]', '[Quick Cast]'),
      row('4', 'For my Friends', '[Metamagic/Targets]', '[Quick Cast]'),
      row('5', 'Body as a Fortress', '[Armor Proficiency A/**]'),
      row('6', 'The Keystone of the Battlefield', '[Armor Proficiency A/**]'),
    ],
  },
];
