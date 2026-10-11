import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { encounterAtom } from '../../state/encounter';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { WeaponDamageRoll } from './WeaponDamageRoll';

function faceValue(face: number): number {
  return (face - 1) / 6;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WeaponDamageRoll', () => {
  it('reproduces the Bastard Sword worked example from Core Rulebook I p. 137', async () => {
    // Power 27, Critical Value 10, Extra Damage 4. First roll 5+5=10 (>= 10, a critical) ->
    // Power Table row 27 column 10 is 9. Rolls again: 6+3=9 (< 10, chain ends) -> column 9
    // is 8. Power Table total 9+8=17, +4 Extra Damage = 21 — exactly the book's numbers.
    const user = userEvent.setup();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(faceValue(5))
      .mockReturnValueOnce(faceValue(5))
      .mockReturnValueOnce(faceValue(6))
      .mockReturnValueOnce(faceValue(3));
    render(<WeaponDamageRoll power={27} criticalValue={10} extraDamage={4} label="Bastard Sword" />);

    await user.click(screen.getByRole('button', { name: /Bastard Sword/ }));

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('5 + 5 = 10 → 9');
    expect(status).toHaveTextContent('6 + 3 = 9 → 8');
    expect(status).toHaveTextContent('Power Table 17 + Extra Damage 4 = 21');
  });

  it('deals zero damage on a first-roll natural 2, skipping Extra Damage entirely', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(1)).mockReturnValueOnce(faceValue(1));
    render(<WeaponDamageRoll power={20} criticalValue={10} extraDamage={5} label="Dagger" />);

    await user.click(screen.getByRole('button', { name: /Dagger/ }));

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('1 + 1 = 2 → 0');
    expect(status).toHaveTextContent('automatic failure');
    expect(status).not.toHaveTextContent('Extra Damage');
  });

  it('a natural 2 mid-chain ends the crit without zeroing the accumulated damage', async () => {
    // Power 20, Critical Value 8. First roll 6+6=12 (>= 8, critical) -> column 12 is 10.
    // Second roll 1+1=2 -> chain ends, adds nothing, no extra 50 XP, but the 10 stands.
    const user = userEvent.setup();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(faceValue(6))
      .mockReturnValueOnce(faceValue(6))
      .mockReturnValueOnce(faceValue(1))
      .mockReturnValueOnce(faceValue(1));
    render(<WeaponDamageRoll power={20} criticalValue={8} extraDamage={2} label="Greatsword" />);

    await user.click(screen.getByRole('button', { name: /Greatsword/ }));

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('6 + 6 = 12 → 10');
    expect(status).toHaveTextContent('1 + 1 = 2 → 0');
    expect(status).toHaveTextContent('Power Table 10 + Extra Damage 2 = 12');
  });

  it('does not chain when the roll is below the Critical Value', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(3)).mockReturnValueOnce(faceValue(3));
    render(<WeaponDamageRoll power={20} criticalValue={10} extraDamage={0} label="Shortbow" />);

    await user.click(screen.getByRole('button', { name: /Shortbow/ }));

    expect(screen.getByRole('status')).toHaveTextContent('3 + 3 = 6 → 4');
    expect(screen.queryByText(/critical/i)).not.toBeInTheDocument();
  });
});

describe('WeaponDamageRoll with declared feats', () => {
  it('adds the flat feat damage after the Calculated Damage and names the feat', async () => {
    // Power 20, roll 5 -> 3, +2 Extra Damage = 5; [Power Strike I] adds 4 -> Total Damage 9.
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(2)).mockReturnValueOnce(faceValue(3));
    render(
      <WeaponDamageRoll power={20} criticalValue={10} extraDamage={2} label="Sword" options={{ bonusDamage: 4, appliedFeats: ['Power Strike I'] }} />,
    );

    await user.click(screen.getByRole('button', { name: /Sword/ }));

    expect(screen.getByRole('status')).toHaveTextContent('Power Table 3 + Extra Damage 2 = 5');
    expect(screen.getByRole('status')).toHaveTextContent('Power Strike I 4 = Total Damage 9');
  });

  it('moves a 3-11 roll one up the table under Lethal Strike', async () => {
    // Power 20 is the identity row (roll n -> n-2). A roll of 5 counts as 6 -> 4.
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(2)).mockReturnValueOnce(faceValue(3));
    render(<WeaponDamageRoll power={20} criticalValue={13} extraDamage={0} label="Sword" options={{ lethal: true }} />);

    await user.click(screen.getByRole('button', { name: /Sword/ }));

    expect(screen.getByRole('status')).toHaveTextContent('2 + 3 = 5 → 4 (+1)');
  });

  it('counts the raised roll towards the Critical Value', async () => {
    // Critical Value 10: a raw 9 would not crit, but under Lethal Strike it counts as 10.
    const user = userEvent.setup();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(faceValue(4))
      .mockReturnValueOnce(faceValue(5))
      .mockReturnValueOnce(faceValue(1))
      .mockReturnValueOnce(faceValue(2));
    render(<WeaponDamageRoll power={20} criticalValue={10} extraDamage={0} label="Sword" options={{ lethal: true }} />);

    await user.click(screen.getByRole('button', { name: /Sword/ }));

    expect(screen.getByRole('status')).toHaveTextContent('critical');
  });
});

describe('WeaponDamageRoll against a monster on the table', () => {
  it('reads Defense from the chosen monster, halves it under Armor Piercer and deals the rest', async () => {
    // Power 20, roll 2+3 -> 3, Extra Damage 10 = 13. Shield Hoodling's Large Shield has Defense 5 -> 3 (half, rounded up).
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(2)).mockReturnValueOnce(faceValue(3));
    const store = createStore();
    store.set(encounterAtom, { round: 1, monsters: [{ id: 'm1', monsterId: 'shield-hoodling', label: 'Hoodling', sections: [{ hp: 19, mp: 12 }] }] });
    render(
      <Provider store={store}>
        <WeaponDamageRoll power={20} criticalValue={13} extraDamage={10} label="Sword" options={{ armorPiercer: 1 }} />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /Sword/ }));
    await screen.findByRole('option', { name: /Hoodling/ });
    await user.selectOptions(screen.getByRole('combobox'), 'm1:0');

    expect(screen.getByRole('status')).toHaveTextContent('Defense 3, dealt 10');
    await user.click(screen.getByRole('button', { name: 'Deal 10' }));
    expect(store.get(encounterAtom).monsters[0].sections[0].hp).toBe(9);
  });
});

describe('WeaponDamageRoll under Snipe', () => {
  it('doubles the Total Damage when the Success Value was 3 or more higher', async () => {
    // Power 20, roll 2+3=5 -> 3, +2 = 5; doubled 10.
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(2)).mockReturnValueOnce(faceValue(3));
    render(<WeaponDamageRoll power={20} criticalValue={10} extraDamage={2} label="Bow" options={{ snipe: true }} />);

    await user.click(screen.getByRole('button', { name: /Bow/ }));

    expect(screen.getByLabelText(/Snipe: Success Value 3\+ higher, damage ×2 = 10/)).not.toBeChecked();
  });
});

describe('WeaponDamageRoll under Repeated Strike II', () => {
  it('adds 4 damage when the first attack hit', async () => {
    // Power 20, roll 2+3=5 -> 3, +2 = 5; +4 -> 9.
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(2)).mockReturnValueOnce(faceValue(3));
    render(<WeaponDamageRoll power={20} criticalValue={10} extraDamage={2} label="Spear" options={{ repeatedStrikeII: true }} />);

    await user.click(screen.getByRole('button', { name: /Spear/ }));
    await user.click(screen.getByRole('checkbox', { name: /Repeated Strike II/ }));

    expect(screen.getByRole('checkbox', { name: /Total Damage 9/ })).toBeChecked();
  });
});
