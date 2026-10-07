/**
 * "Modifying Humanoid Monsters" (Monstrous Lore pp. 223-224): every Humanoid card assumes a
 * Human, and this table turns it into another race. `modification` is applied to the card's
 * numbers; `skills` are added to its Unique Skills.
 */
export interface HumanoidSkill {
  icons: string;
  name: string;
  text: string;
  /** What changes at level 6 and at level 11 or higher, if the book says. */
  level6?: string;
  level11?: string;
}

export interface HumanoidRace {
  id: string;
  /** A caveat the book prints under the race ("cannot cast Divine Magic"). */
  note?: string;
  perception?: string;
  modification: string;
  skills: HumanoidSkill[];
}

export const HUMANOID_RULES = [
  'All Humanoid monsters in this book were created assuming that the race is Human.',
  'When a value is decreased, the minimum Standard Value and Fixed Success Value is treated as "0(7)", the minimum Damage is "2d-2" and the minimum Defense is "0".',
  "[◯Sword's Grace/Change Fate] exists on the assumption that the race is Human; when the race changes it should be removed.",
  "Some racial ability effects are reflected only as modifications and not written into the unique skills (Darkvision is shown as \"Perception Modification: Five Senses (Darkvision)\"). The level 11+ effect of Elf [Sword's Grace/Gentle Water] is left out as unlikely to matter in battle.",
];

export const HUMANOID_RACES: HumanoidRace[] = [
  { id: 'human', modification: 'None', skills: [] },
  {
    id: 'elf',
    perception: 'Five Senses (Darkvision)',
    modification: 'Willpower +1, Damage -1, HP -5, MP +5, Magic Power +1',
    skills: [
      {
        icons: '◯',
        name: "Sword's Grace/Gentle Water",
        text: 'They can breathe and speak underwater and are not affected by adverse effects. Also, the character gains a +2 bonus to Fortitude and Willpower checks against poison and disease types.',
        level6: 'The ability can be given to a single character that shares the same position (area, coordinate).',
      },
    ],
  },
  {
    id: 'dwarf',
    perception: 'Five Senses (Darkvision)',
    modification: 'Fortitude +1, Willpower +1, Accuracy +1, Damage +1, Evasion -2, Defense +2',
    skills: [
      {
        icons: '◯',
        name: "Sword's Grace/Body of Flame",
        text: 'Immune to fire type damage or disadvantageous effects of the fire type.',
        level6: 'The ability can be given to a single character that shares the same position (area, coordinate).',
        level11: 'When energy type damage is suffered, the total damage is automatically halved. Energy type effects with "Resistance: Half" are treated as "Resistance: Neg".',
      },
    ],
  },
  { id: 'tabbit', note: 'A Tabbit cannot cast Divine Magic.', modification: 'Accuracy -2, Evasion -2, MP +5, Magic Power +2', skills: [] },
  {
    id: 'runefolk',
    note: 'Runefolk cannot cast Divine Magic, Fairy Magic, or Nature Magic, and cannot perceive Fairies.',
    perception: 'Five Senses (Darkvision)',
    modification: 'Willpower -1, Accuracy +1, MP -5',
    skills: [
      {
        icons: '►',
        name: 'HP Conversion',
        text: 'Decreases the current value of HP by an arbitrary amount and restores MP by the same amount. Can be used only once a day.',
        level6: 'Can be used as a Minor Action or during Combat Preparation.',
        level11: 'Can instead be used 2 times per day.',
      },
    ],
  },
  {
    id: 'nightmare',
    modification: 'Accuracy +1, Damage +1, HP +5, MP +5, Magic Power +1',
    skills: [
      {
        icons: '◯',
        name: 'Weakness',
        text: 'In addition to silver weapons, the physical and magical damage from any one type of fire, water/ice, earth, or wind (chosen by the GM at creation) is increased by 2 points.',
      },
      {
        icons: '◯',
        name: 'Alternate Form',
        text: 'If the monster can cast spells, its Defense is increased by +2.',
        level6: 'In addition, Damage +1.',
        level11: 'In addition, Accuracy +1 and Magic Power +1.',
      },
    ],
  },
  {
    id: 'lykant',
    note: 'In [Beast Form] a Lykant cannot cast any spells except Divine Magic and Nature Magic.',
    modification: 'Fortitude -1, Willpower -1, Accuracy +1, Damage +1, HP -5, MP -5',
    skills: [
      {
        icons: '►',
        name: 'Beast Form',
        text: 'Gains "Perception: Five Senses (Darkvision)" and damage is increased by +2 points (while not canceled by the same unique skill).',
        level6: 'Can be used as a Minor Action or during Combat Preparation.',
        level11: 'Initiative +1, Evasion +1.',
      },
    ],
  },
  {
    id: 'lildraken',
    modification: 'Fortitude +2, Damage +1, Evasion -2, Defense +2, Magic Power -1, HP +10',
    skills: [
      {
        icons: '⏩',
        name: "Sword's Grace/Wings of the Wind",
        text: 'For 10 seconds (1 round), the user gains a +1 bonus to Accuracy and Evasion checks for Melee Attacks. Can be used up to 6 times per day (6 rounds total).',
        level6: 'No modifications.',
        level11: 'The number of uses per day changes to 12 (12 rounds total).',
      },
    ],
  },
  {
    id: 'grassrunner',
    modification: 'Willpower +2, Accuracy +1, Damage -4, Evasion +2, Defense -4, No MP',
    skills: [
      {
        icons: '◯',
        name: 'Mana Interference',
        text: 'Any magic or effect opposed by Willpower is treated as "Resistance: Neg".',
        level6: 'Once a day, they can try to cancel a spell ("Range: Touch", "Target: One Spell"), rolling Willpower as the Standard Value and comparing with the Success Value.',
      },
    ],
  },
  { id: 'meria', modification: 'Fortitude +2, Willpower +1, Evasion -1, HP +10, MP +5, Magic Power +1', skills: [] },
  {
    id: 'tiens',
    modification: 'Willpower +1, Damage +1',
    skills: [
      {
        icons: '⏩△',
        name: 'Intercommunication',
        text: 'For 1 minute (6 rounds), the Accuracy and Evasion checks of "Target: 1 Entire Character" in the adjacent area (Simplified Combat) or within 10 meters (Standard and Advanced Combat) gain a +1 bonus. Only works if the target is an Animal or Mythical Beast. Can be used once every 6 hours.',
        level6: 'The reach changes to "All areas or within 30m".',
        level11: 'The bonus changes to +2.',
      },
    ],
  },
  {
    id: 'leprechaun',
    note: 'The unique skill is not modified at levels 6 and 11.',
    perception: 'Five Senses (Darkvision)',
    modification: 'Fortitude +1, Accuracy +1, Damage -2, Evasion +1, Defense -2',
    skills: [{ icons: '►', name: 'Unseen Artisan', text: 'The monster disappears by consuming 5 MP. Treat as [Conceal Self] (see CR I, p. 224).' }],
  },
];
