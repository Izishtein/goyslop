/**
 * Advanced Combat — Epic Treasury pp. 78-91, transcribed in
 * docs/sheet-content/23-advanced-combat.md.
 *
 * The last of the six § 3 optional systems, and by far the smallest for what it gives the
 * character sheet: a GM-facing ruleset for running combat on a real 2D battlefield instead of
 * abstract melee/independent bookkeeping. No new classes, feats, spells, or items — only four
 * small reference tables exist in the whole section, the rest is procedure to run at the table.
 */

export interface CombatOpeningDistance {
  situation: string;
  distance: string;
}

export const COMBAT_OPENING_DISTANCES: CombatOpeningDistance[] = [
  { situation: 'Enclosed space', distance: '5m' },
  { situation: 'Relatively large space', distance: '10m' },
  { situation: 'Crowded space, such as a forest', distance: '10m' },
  { situation: 'Open space, such as flat plains', distance: '20m' },
  { situation: 'Moving, such as on horseback', distance: '+10-20m' },
  { situation: 'Fighting a large monster', distance: '+5-10m' },
];

export interface MovementDistance {
  type: string;
  distance: string;
}

export const MOVEMENT_DISTANCES: MovementDistance[] = [
  { type: 'Full Move', distance: 'Movement x 3m' },
  { type: 'Normal Move', distance: 'Movement m' },
  { type: 'Limited Move', distance: '3m (if Movement is less than 3m, then Movement m)' },
];

export interface SkirmishRangeRow {
  participants: string;
  outdoorRadius: string;
  indoorSize: string;
}

export const SKIRMISH_RANGE: SkirmishRangeRow[] = [
  { participants: '2-5', outdoorRadius: '3m', indoorSize: '5x5' },
  { participants: '6-10', outdoorRadius: '4m', indoorSize: '7x7' },
  { participants: '11-15', outdoorRadius: '5m', indoorSize: '8x8' },
  { participants: '16-20', outdoorRadius: '6m', indoorSize: '10x10' },
];

export interface SurpriseModifier {
  condition: string;
  modification: string;
}

export const SURPRISE_MODIFIERS: SurpriseModifier[] = [
  { condition: 'Within 10m', modification: 'Danger Sense +4' },
  { condition: '11-20m', modification: 'Danger Sense +2' },
  { condition: '21-30m', modification: 'No changes' },
  { condition: 'More than 31m', modification: 'Danger Sense -2' },
  { condition: 'Wide field of view', modification: 'Hide check -2' },
  { condition: 'Poor footing, easy to make noise', modification: 'Hide check -2' },
  { condition: 'Full Move', modification: 'Check done by moving Faction -4 (whichever check it is)' },
  { condition: 'Normal Move', modification: 'No changes' },
  { condition: 'Limited Move / No Move', modification: 'Check done by moving Faction +2' },
];
