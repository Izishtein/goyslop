import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { encounterAtom } from '../../state/encounter';
import { AttackPanel, type PanelWeapon } from './AttackPanel';

const face = (value: number) => (value - 1) / 6;

afterEach(() => {
  vi.restoreAllMocks();
});

const sword: PanelWeapon = { id: 'w1', label: 'Sword', accuracy: 4, power: 20, criticalValue: 13, extraDamage: 2 };

function setup(props: Partial<Parameters<typeof AttackPanel>[0]> = {}) {
  const store = createStore();
  store.set(encounterAtom, {
    round: 1,
    monsters: [
      { id: 'm1', monsterId: 'shield-hoodling', label: 'Hoodling A', sections: [{ hp: 19, mp: 12 }] },
      { id: 'm2', monsterId: 'shield-hoodling', label: 'Hoodling B', sections: [{ hp: 19, mp: 12 }] },
    ],
  });
  render(
    <Provider store={store}>
      <AttackPanel weapons={[sword]} options={{}} targetLimit={1} repeated={false} {...props} />
    </Provider>,
  );
  return { store, user: userEvent.setup() };
}

describe('AttackPanel', () => {
  it('draws nothing while the table is empty', () => {
    const store = createStore();
    const { container } = render(
      <Provider store={store}>
        <AttackPanel weapons={[sword]} options={{}} targetLimit={1} repeated={false} />
      </Provider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('rolls Accuracy against the target card, a miss offers no damage', async () => {
    // 2+3 + 4 = 9 against the Hoodling's fixed Evasion 3+7 = 10: evaded.
    vi.spyOn(Math, 'random').mockReturnValueOnce(face(2)).mockReturnValueOnce(face(3));
    const { user } = setup();
    await screen.findByLabelText(/Hoodling A/);
    await user.click(screen.getByLabelText(/Hoodling A/));
    await user.click(screen.getByLabelText('Fixed Evasion'));
    await user.click(screen.getByRole('button', { name: 'Attack' }));

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Accuracy: 2d6 (2+3) + 4 = 9');
    expect(status).toHaveTextContent('Evasion 10 — evaded');
    expect(within(status).queryByRole('button', { name: /Sword/ })).toBeNull();
  });

  it('puts the damage of a hit on the very target the check was made against', async () => {
    // 5+4 + 4 = 13 beats the fixed Evasion 10; the damage roll 6+5 is then aimed at Hoodling B alone.
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(face(5))
      .mockReturnValueOnce(face(4))
      .mockReturnValueOnce(face(6))
      .mockReturnValueOnce(face(5));
    const { store, user } = setup();
    await screen.findByLabelText(/Hoodling A/);
    await user.click(screen.getByLabelText(/Hoodling B/));
    await user.click(screen.getByLabelText('Fixed Evasion'));
    await user.click(screen.getByRole('button', { name: 'Attack' }));

    expect(screen.getByRole('status')).toHaveTextContent('hit (by 3)');
    await user.click(screen.getByRole('button', { name: /Sword → Hoodling B/ }));
    await screen.findByRole('option', { name: /Hoodling B/ });
    expect((screen.getAllByRole('combobox').at(-1) as HTMLSelectElement).value).toBe('m2:0');
    await user.click(screen.getByRole('button', { name: /^Deal/ }));
    expect(store.get(encounterAtom).monsters[1].sections[0].hp).toBeLessThan(19);
    expect(store.get(encounterAtom).monsters[0].sections[0].hp).toBe(19);
  });

  it('under Cleave makes one Accuracy check for up to three targets and refuses a fourth', async () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(face(5)).mockReturnValueOnce(face(4));
    const { user } = setup({ targetLimit: 3 });
    await screen.findByLabelText(/Hoodling A/);
    await user.click(screen.getByLabelText(/Hoodling A/));
    await user.click(screen.getByLabelText(/Hoodling B/));
    await user.click(screen.getByLabelText('Fixed Evasion'));
    await user.click(screen.getByRole('button', { name: 'Attack' }));

    const status = screen.getByRole('status');
    expect(status.textContent?.match(/Accuracy: 2d6/g)).toHaveLength(1);
    expect(status.textContent?.match(/hit \(by 3\)/g)).toHaveLength(2);
  });

  it('under Repeated Strike rolls once more against the one who evaded', async () => {
    // First: 2+2 + 4 = 8 misses (10). Second: 6+4 + 4 = 14 hits.
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(face(2))
      .mockReturnValueOnce(face(2))
      .mockReturnValueOnce(face(6))
      .mockReturnValueOnce(face(4));
    const { user } = setup({ repeated: true });
    await screen.findByLabelText(/Hoodling A/);
    await user.click(screen.getByLabelText(/Hoodling A/));
    await user.click(screen.getByLabelText('Fixed Evasion'));
    await user.click(screen.getByRole('button', { name: 'Attack' }));

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Repeated Strike');
    expect(status.textContent?.match(/Accuracy: 2d6/g)).toHaveLength(2);
    expect(within(status).getByRole('button', { name: /Sword → Hoodling A/ })).toBeInTheDocument();
  });

  it('offers the double-1 XP on a fumble', async () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(face(1)).mockReturnValueOnce(face(1));
    const { user } = setup();
    await screen.findByLabelText(/Hoodling A/);
    await user.click(screen.getByLabelText(/Hoodling A/));
    await user.click(screen.getByLabelText('Fixed Evasion'));
    await user.click(screen.getByRole('button', { name: 'Attack' }));
    expect(screen.getByRole('status')).toHaveTextContent('double 1 — automatic miss');
  });

  describe('with Dual Wielding', () => {
    const dagger: PanelWeapon = { id: 'w2', label: 'Dagger', accuracy: 3, power: 10, criticalValue: 11, extraDamage: 2 };

    it('makes one attack with each hand, each at the penalty, and aims the damage of each', async () => {
      // main hand: 5+5 + (4−2) = 12 hits the fixed Evasion 10; off hand: 2+3 + (3−2) = 6 misses.
      vi.spyOn(Math, 'random').mockReturnValueOnce(face(5)).mockReturnValueOnce(face(5)).mockReturnValueOnce(face(2)).mockReturnValueOnce(face(3));
      const { user } = setup({ weapons: [sword, dagger], dual: { penalty: 2, twinStrike: false } });
      await screen.findByLabelText(/Hoodling A/);
      await user.click(screen.getByLabelText(/Hoodling A/));
      await user.click(screen.getByLabelText('Fixed Evasion'));
      await user.click(screen.getByRole('button', { name: /Attack twice/ }));

      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('Main hand: Sword');
      expect(status).toHaveTextContent('Accuracy: 2d6 (5+5) + 2 = 12');
      expect(status).toHaveTextContent('Off hand: Dagger');
      expect(status).toHaveTextContent('Accuracy: 2d6 (2+3) + 1 = 6');
      expect(within(status).getByRole('button', { name: /Sword → Hoodling A/ })).toBeInTheDocument();
      expect(within(status).queryByRole('button', { name: /Dagger →/ })).toBeNull();
    });

    it('takes no penalty off when Dual Technique removes it', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(face(3));
      const { user } = setup({ weapons: [sword, dagger], dual: { penalty: 0, twinStrike: false } });
      await screen.findByLabelText(/Hoodling A/);
      await user.click(screen.getByLabelText(/Hoodling A/));
      await user.click(screen.getByRole('button', { name: /Attack twice \(−0 each\)/ }));
      expect(screen.getByRole('status')).toHaveTextContent('Accuracy: 2d6 (3+3) + 4 = 10');
    });

    it('under Twin Strike waits for the first result and lets the second attack choose another target', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(face(3));
      const { user } = setup({ weapons: [sword, dagger], dual: { penalty: 2, twinStrike: true } });
      await screen.findByLabelText(/Hoodling A/);
      await user.click(screen.getByLabelText(/Hoodling A/));
      await user.click(screen.getByLabelText('Fixed Evasion'));
      await user.click(screen.getByRole('button', { name: /Attack twice/ }));
      expect(screen.getByRole('status').textContent?.match(/Accuracy: 2d6/g)).toHaveLength(1);

      const second = screen.getByRole('group', { name: /Second attack — target/ });
      await user.click(within(second).getByLabelText(/Hoodling A/));
      await user.click(within(second).getByLabelText(/Hoodling B/));
      await user.click(within(second).getByRole('button', { name: /Second attack \(Dagger\)/ }));
      const status = screen.getByRole('status');
      expect(status.textContent?.match(/Accuracy: 2d6/g)).toHaveLength(2);
      expect(status).toHaveTextContent('Off hand: Dagger');
      expect(status).toHaveTextContent(/Hoodling B[^:]*: Evasion 10/);
    });
  });

  describe('shooting into a skirmish', () => {
    const bow: PanelWeapon = { id: 'b1', label: 'Bow', accuracy: 4, power: 20, criticalValue: 12, extraDamage: 2, ranged: true };

    it('sends the shot to a random participant of the skirmish, the checked targets being the whole crowd', async () => {
      // stray pick 0.9 of two enemies → Hoodling B; then Accuracy 3+3 + 4 = 10 (a tie with the fixed Evasion 10: evaded)
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(face(3)).mockReturnValueOnce(face(3));
      const { user } = setup({ weapons: [bow] });
      await screen.findByLabelText(/Hoodling A/);
      await user.click(screen.getByLabelText(/Shooting into a skirmish/));
      await user.click(screen.getByLabelText(/Hoodling A/));
      await user.click(screen.getByLabelText(/Hoodling B/));
      await user.click(screen.getByLabelText('Fixed Evasion'));
      await user.click(screen.getByRole('button', { name: 'Attack' }));
      const status = screen.getByRole('status');
      expect(status).toHaveTextContent(/Stray shot: the shot goes to Hoodling B/);
      expect(status).toHaveTextContent(/Hoodling B[^:]*: Evasion 10 — evaded/);
      expect(status).not.toHaveTextContent(/Hoodling A[^:]*: Evasion/);
    });

    it('may send it onto an ally standing in the skirmish', async () => {
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.99).mockReturnValueOnce(face(3)).mockReturnValueOnce(face(3));
      const { user } = setup({ weapons: [bow] });
      await screen.findByLabelText(/Hoodling A/);
      await user.click(screen.getByLabelText(/Shooting into a skirmish/));
      await user.clear(screen.getByLabelText('Allies in the skirmish'));
      await user.type(screen.getByLabelText('Allies in the skirmish'), '2');
      await user.click(screen.getByLabelText(/Hoodling A/));
      await user.click(screen.getByRole('button', { name: 'Attack' }));
      expect(screen.getByRole('status')).toHaveTextContent('goes to an ally in the skirmish');
    });

    it('is not offered to a melee weapon, nor to a marksman with Targeting', async () => {
      setup();
      await screen.findByLabelText(/Hoodling A/);
      expect(screen.queryByLabelText(/Shooting into a skirmish/)).toBeNull();
    });

    it('hides the stray option for [Targeting]', async () => {
      setup({ weapons: [bow], targeting: true });
      await screen.findByLabelText(/Hoodling A/);
      expect(screen.queryByLabelText(/Shooting into a skirmish/)).toBeNull();
    });
  });
});
