import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockPokemon } from '../data/mockPokemon';
import { pokemonTypes } from '../domain/pokemon/types';
import { FilteredPokemonList } from './FilteredPokemonList';

function renderList() {
  render(<FilteredPokemonList pokemon={mockPokemon} types={pokemonTypes} />);
}

describe('FilteredPokemonList', () => {
  it('спочатку показує всі 12 mock-записів', () => {
    renderList();
    expect(screen.getByRole('combobox', { name: 'Тип Pokémon' })).toHaveValue(
      'all',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Показано 12 із 12');
    expect(screen.getByText('Eevee')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Скинути фільтр' }),
    ).toBeDisabled();
  });

  it('контрольований select показує тільки вибраний тип', async () => {
    const user = userEvent.setup();
    renderList();
    const select = screen.getByRole('combobox', { name: 'Тип Pokémon' });
    await user.selectOptions(select, 'fire');
    expect(select).toHaveValue('fire');
    expect(screen.getByRole('status')).toHaveTextContent('Показано 2 із 12');
    const list = within(screen.getByRole('list', { name: 'Список Pokémon' }));
    expect(list.getByText('Charmander')).toBeInTheDocument();
    expect(list.getByText('Charmeleon')).toBeInTheDocument();
    expect(list.queryByText('Squirtle')).not.toBeInTheDocument();
  });

  it('враховує другий тип Pokémon', async () => {
    const user = userEvent.setup();
    renderList();
    await user.selectOptions(screen.getByRole('combobox'), 'poison');
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('Ivysaur')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Показано 2 із 12');
  });

  it('пояснює відсутність збігів і скидає фільтр', async () => {
    const user = userEvent.setup();
    renderList();
    await user.selectOptions(screen.getByRole('combobox'), 'ice');
    expect(
      screen.getByRole('heading', { name: 'Pokémon не знайдено' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Показано 0 із 12');
    expect(
      screen.queryByRole('list', { name: 'Список Pokémon' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Скинути фільтр' }));
    expect(screen.getByRole('combobox')).toHaveValue('all');
    expect(screen.getByRole('status')).toHaveTextContent('Показано 12 із 12');
  });

  it('обробляє порожній масив у props', () => {
    render(<FilteredPokemonList pokemon={[]} types={pokemonTypes} />);
    expect(screen.getByRole('status')).toHaveTextContent('Показано 0 із 0');
    expect(
      screen.getByRole('heading', { name: 'Pokémon не знайдено' }),
    ).toBeInTheDocument();
  });
});
