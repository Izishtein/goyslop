/*
 * The vessels of a voyage and the goods they carry. Our own tables: Ruxe has no printed seafaring
 * rules in the books we own. Numbers here are used by voyage.ts, boarding.ts and the panel.
 */

export const SHIPS = ['boat', 'cog', 'galleon'] as const;
export type Ship = (typeof SHIPS)[number];

/** Hull points by ship: what a storm and a sea monster chip away. */
export const HULL: Record<Ship, number> = { boat: 8, cog: 14, galleon: 22 };

/** Evasion of the ship against an attack: the bigger the hull, the harder it is to miss. */
export const SHIP_EVASION: Record<Ship, number> = { boat: 6, cog: 4, galleon: 2 };

/** Added to the damage of a broadside: swivel guns, ballistae, a row of cannon-ports. */
export const SHIP_GUNS: Record<Ship, number> = { boat: 0, cog: 1, galleon: 2 };

/** Crates a hold takes. */
export const CARGO: Record<Ship, number> = { boat: 4, cog: 10, galleon: 24 };

/** What a shipwright asks for a hull, in G. */
export const SHIP_PRICE: Record<Ship, number> = { boat: 3000, cog: 15000, galleon: 60000 };

/** Sailors a ship needs to be sailed properly. */
export const CREW_NEEDED: Record<Ship, number> = { boat: 2, cog: 6, galleon: 14 };

/** What a sailor asks to sign on, in G (paid once). */
export const HIRE_FEE = 25;

/** A fleet never grows past this many ships. */
export const FLEET_MAX = 3;

export const GOODS = ['grain', 'salt', 'cloth', 'wine', 'iron', 'spice'] as const;
export type Good = (typeof GOODS)[number];

/** The base price of one crate of each good, in G. */
export const GOOD_PRICE: Record<Good, number> = { grain: 60, salt: 120, cloth: 200, wine: 300, iron: 250, spice: 600 };

/** A market's d6 for a good and what it does to the base price: 1 glut, 2 cheap, 3–4 fair, 5 dear, 6 scarce. */
export function priceFactor(roll: number): number {
  if (roll <= 1) return 0.6;
  if (roll === 2) return 0.8;
  if (roll <= 4) return 1;
  return roll === 5 ? 1.25 : 1.5;
}

/** The price of one crate where the market rolled `roll` for it. */
export function goodPrice(good: Good, roll: number): number {
  return Math.round(GOOD_PRICE[good] * priceFactor(roll));
}
