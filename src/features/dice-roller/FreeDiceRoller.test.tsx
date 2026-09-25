import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { FreeDiceRoller } from './FreeDiceRoller';

/** Math.random() -> 1 + Math.floor(random * sides) needs a value in [n/sides, (n+1)/sides)
 *  to land on face n+1. Picking the low end of the interval keeps this exact. */
function faceValue(face: number, sides: number): number {
  return (face - 1) / sides;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FreeDiceRoller', () => {
  it('is closed until the floating button is clicked', async () => {
    const user = userEvent.setup();
    render(<FreeDiceRoller />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Roll dice' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('defaults to 2d6 and applies the SW2.5 fumble/critical read', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValueOnce(faceValue(1, 6)).mockReturnValueOnce(faceValue(1, 6));
    render(<FreeDiceRoller />);

    await user.click(screen.getByRole('button', { name: 'Roll dice' }));
    await user.click(screen.getByRole('button', { name: 'Roll' }));

    expect(screen.getByRole('status')).toHaveTextContent('1 + 1 + 0 = 2');
    expect(screen.getByRole('status')).toHaveTextContent('automatic failure');
  });

  it('rolls an arbitrary NdM with a modifier and no automatic outcome', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(faceValue(12, 20))
      .mockReturnValueOnce(faceValue(3, 20))
      .mockReturnValueOnce(faceValue(9, 20));
    render(<FreeDiceRoller />);

    await user.click(screen.getByRole('button', { name: 'Roll dice' }));
    fireEvent.change(screen.getByLabelText('Count'), { target: { value: '3' } });
    await user.selectOptions(screen.getByLabelText('Sides'), '20');
    fireEvent.change(screen.getByLabelText('Modifier'), { target: { value: '4' } });
    await user.click(screen.getByRole('button', { name: 'Roll' }));

    // 12 + 3 + 9 = 24, + 4 = 28, no fumble/critical outside the 2d6 shape.
    expect(screen.getByRole('status')).toHaveTextContent('12 + 3 + 9 + 4 = 28');
    expect(screen.queryByText(/automatic/)).not.toBeInTheDocument();
  });
});
