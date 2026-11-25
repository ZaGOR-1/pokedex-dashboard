import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FavoriteButton } from './FavoriteButton';
import { useDashboardStore } from '../app/dashboardStore';

describe('FavoriteButton', () => {
  it('узгоджує дві кнопки одного Pokémon і не змінює іншого', async () => {
    const user = userEvent.setup();
    render(
      <>
        <FavoriteButton pokemonId={133} pokemonName="eevee" />
        <FavoriteButton pokemonId={133} pokemonName="eevee" />
        <FavoriteButton pokemonId={25} pokemonName="pikachu" />
      </>,
    );
    await user.click(
      screen.getAllByRole('button', { name: 'Обране: eevee' })[0]!,
    );
    expect(
      screen.getAllByRole('button', {
        name: 'Обране: eevee',
        pressed: true,
      }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Обране: pikachu' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(useDashboardStore.getState().favoriteIds).toEqual([133]);
    await user.click(
      screen.getAllByRole('button', { name: 'Обране: eevee' })[1]!,
    );
    expect(
      screen.getAllByRole('button', {
        name: 'Обране: eevee',
        pressed: false,
      }),
    ).toHaveLength(2);
    expect(useDashboardStore.getState().favoriteIds).toEqual([]);
  });

  it.each(['{Enter}', ' '])('підтримує клавішу %s', async (key) => {
    const user = userEvent.setup();
    render(<FavoriteButton pokemonId={133} pokemonName="eevee" />);
    const button = screen.getByRole('button', { name: 'Обране: eevee' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard(key);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAccessibleName('Обране: eevee');
    await user.keyboard(key);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});
