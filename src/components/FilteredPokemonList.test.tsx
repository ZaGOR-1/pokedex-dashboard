import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockPokemon } from '../../tests/fixtures/mockPokemon';
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
    const list = within(screen.getByRole('table'));
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
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
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

  it('сортує назву та HP в обох напрямках і зберігає сортування після фільтра', async () => {
    const user = userEvent.setup();
    renderList();
    const names = () =>
      within(screen.getByRole('table'))
        .getAllByRole('rowheader')
        .map((row) => row.textContent);
    await user.click(screen.getByRole('button', { name: 'Назва' }));
    expect(names()[0]).toBe('Bulbasaur');
    expect(screen.getByRole('columnheader', { name: /Назва/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await user.click(screen.getByRole('button', { name: 'Назва' }));
    expect(names()[0]).toBe('Wartortle');
    expect(screen.getByRole('columnheader', { name: /Назва/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await user.click(screen.getByRole('button', { name: 'HP' }));
    expect(names()[0]).toBe('Pikachu');
    await user.click(screen.getByRole('button', { name: 'HP' }));
    expect(names()[0]).toBe('Jigglypuff');
    expect(screen.getByRole('columnheader', { name: /HP/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await user.selectOptions(screen.getByRole('combobox'), 'fire');
    expect(names()).toEqual(['Charmeleon', 'Charmander']);
    await user.click(screen.getByRole('button', { name: 'Скинути фільтр' }));
    expect(names()[0]).toBe('Jigglypuff');
    expect(mockPokemon.map((item) => item.id)).toEqual([
      1, 2, 4, 5, 7, 8, 10, 16, 25, 27, 39, 133,
    ]);
  });

  it('показує прочерк для відсутніх характеристик і типів', () => {
    render(
      <FilteredPokemonList
        pokemon={[
          {
            ...mockPokemon[0]!,
            types: [],
            stats: { hp: null, attack: null, defense: null },
          },
        ]}
        types={pokemonTypes}
      />,
    );
    expect(within(screen.getByRole('table')).getAllByText('—')).toHaveLength(4);
  });

  it('показує новий тип із базовим бейджем, залишаючи 18 типів у фільтрі', async () => {
    const user = userEvent.setup();
    render(
      <FilteredPokemonList
        pokemon={[{ ...mockPokemon[0]!, types: ['grass', 'stellar'] }]}
        types={pokemonTypes}
      />,
    );
    expect(screen.getByText('stellar')).toHaveClass(
      'type-badge',
      'type-stellar',
    );
    const select = screen.getByRole('combobox', { name: 'Тип Pokémon' });
    expect(within(select).getAllByRole('option')).toHaveLength(19);
    expect(
      within(select).queryByRole('option', { name: 'stellar' }),
    ).not.toBeInTheDocument();
    await user.selectOptions(select, 'grass');
    expect(screen.getByText('stellar')).toBeInTheDocument();
    await user.selectOptions(select, 'ice');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Скинути фільтр' }));
    expect(screen.getByText('stellar')).toBeInTheDocument();
  });
});
