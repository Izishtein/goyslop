import type { MonsterSkill } from './types';

/**
 * Abilities the book prints once per classification and leaves out of every card of it
 * (Monstrous Lore pp. 134, 149, 159, 187, 227, 236, 238). Text is the book's, lightly cut.
 */
export interface CommonAbilityGroup {
  title: string;
  /** Plain prose above the skills (shared basic data, how the group is read). */
  intro?: string[];
  skills: MonsterSkill[];
}

const skill = (icons: string, name: string, ...text: string[]): MonsterSkill => ({ icons, name, text });

const immunities = (kind: string): MonsterSkill =>
  skill('◯', 'Poison Immunity, ◯Disease Immunity, ◯Psychic Immunity', `${kind} are immune to poison or disease effects or damage. They are also immune to psychic effects.`);

const constructHealing = (kind: string): MonsterSkill[] => [
  skill('◯', 'Partial Healing Immunity', `Effects of healing ${kind} HP are very limited and come only from Spiritualism Magic and some special items.`, 'Healing effects such as Divine Magic, Fairy Magic, and Nature Magic cannot restore HP.'),
  skill('◯', 'Can be Detected', 'They can be detected by the [Sense Magic] spell and similar effects.'),
];

export const COMMON_ABILITIES: Record<string, CommonAbilityGroup[]> = {
  Undead: [
    {
      title: 'Common Abilities of Undead (p. 134)',
      skills: [
        skill('◯', 'Poison Immunity, ◯Disease Immunity, ◯Psychic Type (Weak) Immunity', 'The Undead are immune to any poison or disease-type effects or damage. They are also immune to psychic effects.'),
        skill('◯', 'Unstable Healing', "Healing effects such as Divine Magic and items like Unicorn's Horn will damage Undead.", 'Magitech, Fairy Magic, Nature Magic, etc., will have no effect on the Undead.', "Spiritualism Magic and a few other healing effects can restore the Undead's HP."),
      ],
    },
  ],
  Constructs: [{ title: 'Common Abilities of Constructs (p. 149)', skills: [immunities('Constructs and magitechs'), ...constructHealing('Construct')] }],
  Magitech: [{ title: 'Common Abilities of Magitech (p. 159)', skills: [immunities('Constructs and magitechs'), ...constructHealing('Magitech')] }],
  Fairies: [
    {
      title: 'Common Abilities of All Fairies (p. 187)',
      skills: [skill('◯', 'Invisible Against Runefolk', 'Runefolk cannot see fairies.'), skill('◯', 'No Loot', 'A fairy does not leave any loot.')],
    },
    {
      title: 'Normal Fairies',
      skills: [
        skill(
          '◯',
          'Type: **/Magic Power X(Y)',
          'Monster data with this unique skill indicates a normal fairy. Every normal fairy has one of these types: earth, water/ice, fire, wind, light, or dark, and can use Fairy Magic of that type up to the rank of its monster level. It cannot use any other type of magic or basic Fairy Magic.',
          'A fairy does not receive any damage or disadvantage from the effect of its own type. Fairies of the dark type have Psychic Immunity. Light type fairies have no immunities.',
        ),
        skill('◯', 'Knowledge = Fairy Tamers', 'Characters with the Fairy Tamer class automatically succeed in the Monster Knowledge check against fairies (the Sage class and the original success value are required to know the weak point).'),
      ],
    },
    {
      title: 'Olden Fairies',
      skills: [
        skill(
          '◯',
          'Olden/Type: A & B/Magic Power X(Y)',
          'Monster data with this unique skill indicates an olden fairy. It has multiple types and can cast Fairy Magic of each type up to its own level, but not Basic Fairy Magic. It has the immunities of each of its types.',
          'To summon an olden fairy with [Summon Fairy], the Fairy Tamer must have all its types selected.',
        ),
        skill('', 'Fairy Tamer Cannot Automatically Identify', 'Even a Fairy Tamer needs a Monster Knowledge check to know the abilities and data of an olden fairy.'),
      ],
    },
  ],
  Golems: [
    {
      title: 'Common Abilities of Golems (p. 227)',
      intro: [
        'All golems are Constructs. Common basic data — Intelligence: Servant, Perception: Magic, Disposition: Instructed, Language: None, Habitat: Various (the ruins of the Magic Civilization Period are the most common place to meet one).',
        'Loot comes only from golems that have been active for a long time; a golem created by a PC drops none. A golem found with Enhancing Items gives them to whoever defeats it. Golems from the Magic Civilization Period were sometimes built with lost techniques and carry more Enhancing Items than the maximum, especially Garnets of Vitality.',
      ],
      skills: [
        skill('◯', 'Poison Immunity, ◯Disease Immunity, ◯Psychic Immunity', 'Golems, as constructs, are immune to any damage or effects of these types.'),
        skill('◯', 'Can be Detected', 'Golems are detected by spells such as [Sense Magic] and [Mana Search].'),
        skill('◯', 'Artificial', 'Golems cannot be healed with some spells, items, etc. — only with those that restore constructs HP.'),
        skill('◯', 'Knowledge = Conjurer class', 'The Conjurer class automatically succeeds in the Monster Knowledge check against golems; the Sage class and the original success value are needed to know the weak point.'),
      ],
    },
  ],
  Familiars: [
    {
      title: 'Common Abilities of Familiars (p. 236)',
      intro: [
        'Summoned with the Truespeech Magic spell [Familiar]. Common basic data — Intelligence: None, Perception: Shared with Caster, Disposition: Instructed, Language: None, Habitat: Various, Rep/Weak: 8/-, Weak Point: None, Fortitude and Willpower: none.',
        'A Familiar uses the general monster layout, but has no HP of its own: damage to it reduces the HP of its Master.',
      ],
      skills: [
        skill('◯', 'Poison Immunity, ◯Disease Immunity, ◯Psychic Immunity', 'Familiars, being constructs, are immune to any damage or effects of these types.'),
        skill('◯', 'Can be Detected', 'Familiars can be detected by spells such as [Sense Magic] and [Mana Search].'),
        skill('◯', 'Familiar Contract', 'A Master can only have one Familiar at a time and can cancel the contract with a Major Action. If the contract is canceled or the Master dies, the Familiar disappears. If the Master falls unconscious, the Familiar stays in place and cannot act.'),
        skill('◯', 'Familiars Knowledge = Sorcerers', 'The Sorcerer class automatically succeeds in any Monster Knowledge check against Familiars. Familiars have no Weak Point.'),
        skill('◯', 'No HP', "If damage is inflicted on a familiar, it reduces the HP of the Familiar's Master instead."),
        skill('◯', 'Shared MP', "The Master can use the Familiar's MP as their own while the two are in physical contact. The Familiar's MP is restored at the same rate as its Master's."),
        skill('◯', 'One Mind, One Character', 'A Familiar touching its Master is treated with the Master as 1 character for area effects, and cannot be the target of melee attacks, ranged attacks, magic, or effects that target a character. If the Familiar makes a melee attack itself, this skill is lost for the next 10 seconds (1 round).'),
        skill('◯', 'Resistance Sharing', "When a Familiar makes a Fortitude or Willpower save, it uses its Master's Standard Values. The Master always knows if their familiar must make a save."),
        skill('◯', 'Senses Sharing', 'A Familiar shares sight and hearing (including Darkvision) with its Master.'),
        skill('◯', 'Fall Resistance', 'A Familiar takes no damage from falling.'),
        skill('◯', 'No Loot', 'Defeating a Familiar yields no loot.'),
        skill('◯', 'Will-less', 'A Familiar has no free will of its own.'),
      ],
    },
    {
      title: 'Familiars II (p. 238)',
      intro: ['Summoned with [Familiar II] (CR III, p. 134). Common basic data — Intelligence: Average, Perception: Shared with Caster, Disposition: Instructed, Language: Arcana, Habitat: Various, Rep/Weak: 12/-, Weak Point: None. The common abilities are the same as a Familiar, with these changes:'],
      skills: [
        skill('◯', 'Familiar Contract', 'A Master can have only one familiar at a time, whether Familiar or Familiar II.'),
        skill('◯', 'Free Will', 'A Familiar II has free will (unlike [Will-less]) and can talk in Arcana, but is extremely loyal and never acts against its Master.'),
        skill('◯', 'Shared Visibility', "The caster can use the Familiar II's field of view to cast spells, but the base point of the spell is always the caster (range, \"Shot\" and \"Line\" are measured from the caster). A spell cast with a Major Action costs both the Master's and the Familiar II's Major Action; with a Minor Action, both spend a Minor Action."),
      ],
    },
  ],
};
