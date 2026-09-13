import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
