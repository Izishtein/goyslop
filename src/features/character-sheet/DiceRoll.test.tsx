import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { DiceRoll } from './DiceRoll';

/** Math.random() -> 1 + Math.floor(random * 6) needs a value in [n/6, (n+1)/6) to land on
 *  face n+1. Picking the low end of the interval keeps this exact across engines. */
function faceValue(face: number): number {
  return (face - 1) / 6;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DiceRoll', () => {
  it('shows nothing until rolled, then the two dice plus the modifier', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(3)).mockReturnValueOnce(faceValue(4));
    render(<DiceRoll modifier={2} label="Fortitude" />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Fortitude/ }));

    // 3 + 4 + 2 = 9, no automatic outcome.
    expect(screen.getByRole('status')).toHaveTextContent('3 + 4 + 2 = 9');
  });

  it('flags snake eyes as an automatic failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(1)).mockReturnValueOnce(faceValue(1));
    render(<DiceRoll modifier={5} label="Accuracy" />);

    await user.click(screen.getByRole('button', { name: /Accuracy/ }));

    expect(screen.getByRole('status')).toHaveTextContent('automatic failure');
  });

  it('flags boxcars as an automatic success', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(6)).mockReturnValueOnce(faceValue(6));
    render(<DiceRoll modifier={0} label="Evasion" />);

    await user.click(screen.getByRole('button', { name: /Evasion/ }));

    expect(screen.getByRole('status')).toHaveTextContent('automatic success');
  });

  it('renders a negative modifier with a minus sign', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(2)).mockReturnValueOnce(faceValue(3));
    render(<DiceRoll modifier={-1} label="Willpower" />);

    await user.click(screen.getByRole('button', { name: /Willpower/ }));

    // 2 + 3 - 1 = 4.
    expect(screen.getByRole('status')).toHaveTextContent('2 + 3 − 1 = 4');
  });

  it('re-rolls on a second click, replacing the previous result', async () => {
    const user = userEvent.setup();
    const random = vi.spyOn(Math, 'random');
    random.mockReturnValueOnce(faceValue(3)).mockReturnValueOnce(faceValue(4));
    render(<DiceRoll modifier={0} label="Fortitude" />);

    const button = screen.getByRole('button', { name: /Fortitude/ });
    await user.click(button);
    expect(screen.getByRole('status')).toHaveTextContent('3 + 4 + 0 = 7');

    random.mockReturnValueOnce(faceValue(5)).mockReturnValueOnce(faceValue(6));
    await user.click(button);

    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('5 + 6 + 0 = 11');
  });
});
