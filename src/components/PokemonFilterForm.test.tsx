import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockPokemon } from '../../tests/fixtures/mockPokemon';
import { apiList, apiPokemon } from '../../tests/fixtures/pokeapi';
import { createPokeApiClient } from '../infrastructure/pokeapi/PokeApiClient';
import { App } from '../app/App';

function expectKpi(title: string, value: number) {
  expect(
    within(screen.getByRole('article', { name: title })).getByText(
      String(value),
    ),
  ).toBeInTheDocument();
}

function expectSummary(
  total: number,
  typeCount: number,
  multiTypeCount: number,
) {
  expectKpi('Pokémon у вибірці', total);
  expectKpi('Типів у вибірці', typeCount);
  expectKpi('Із двома типами', multiTypeCount);
  expectKpi('Усього записів Pokémon', 1350);
}

async function renderDashboard() {
  const loadPokemon = vi.fn(async () => ({
    pokemon: mockPokemon,
    totalCount: 1350,
  }));
  render(<App loadPokemon={loadPokemon} />);
  await screen.findByRole('table');
  return loadPokemon;
}

function changeField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

const names = () =>
  within(screen.getByRole('table'))
    .getAllByRole('rowheader')
    .map((row) => row.textContent);

afterEach(() => vi.useRealTimers());

describe('PokemonFilterForm: інтеграція', () => {
  it('контролює три поля; назва після debounce поєднується з типом і HP', async () => {
    const loadPokemon = await renderDashboard();
    vi.useFakeTimers();
    expect(
      screen.getByRole('searchbox', { name: 'Назва Pokémon' }),
    ).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Тип Pokémon' })).toHaveValue(
      'all',
    );
    expect(screen.getByRole('textbox', { name: 'Мінімальний HP' })).toHaveValue(
      '',
    );
    expectSummary(12, 10, 4);

    changeField('Назва Pokémon', '  IVY  ');
    expect(screen.getByLabelText('Назва Pokémon')).toHaveValue('  IVY  ');
    act(() => vi.advanceTimersByTime(399));
    expect(names()).toHaveLength(12);
    expectSummary(12, 10, 4);
    act(() => vi.advanceTimersByTime(1));
    expect(names()).toEqual(['Ivysaur']);
    expectSummary(1, 2, 1);

    changeField('Тип Pokémon', 'poison');
    changeField('Мінімальний HP', '60');
    expect(screen.getByLabelText('Тип Pokémon')).toHaveValue('poison');
    expect(screen.getByLabelText('Мінімальний HP')).toHaveValue('60');
    expect(names()).toEqual(['Ivysaur']);
    expectSummary(1, 2, 1);
    changeField('Мінімальний HP', '61');
    expect(
      screen.getByRole('heading', { name: 'Pokémon не знайдено' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expectSummary(0, 0, 0);
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });

  it('швидкі зміни застосовують останню назву, не створюючи запитів', async () => {
    const loadPokemon = await renderDashboard();
    vi.useFakeTimers();
    changeField('Назва Pokémon', 'bulba');
    act(() => vi.advanceTimersByTime(300));
    changeField('Назва Pokémon', 'char');
    act(() => vi.advanceTimersByTime(100));
    expect(names()).toHaveLength(12);
    changeField('Тип Pokémon', 'fire');
    expect(names()).toEqual(['Charmander', 'Charmeleon']);
    changeField('Назва Pokémon', 'charmeleon');
    act(() => vi.advanceTimersByTime(399));
    expect(names()).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(names()).toEqual(['Charmeleon']);
    expectSummary(1, 1, 0);
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });

  it.each(['-1', '2.5', '2,5', 'abc', '1e2', 'Infinity', '9007199254740992'])(
    'відхиляє некоректний HP %s і зберігає попередній стан',
    async (value) => {
      const loadPokemon = await renderDashboard();
      changeField('Мінімальний HP', '60');
      expect(names()).toEqual(['Ivysaur', 'Jigglypuff']);
      changeField('Мінімальний HP', value);
      expect(screen.getByLabelText('Мінімальний HP')).toHaveValue('60');
      expect(names()).toEqual(['Ivysaur', 'Jigglypuff']);
      expectSummary(2, 4, 2);
      expect(loadPokemon).toHaveBeenCalledTimes(1);
    },
  );

  it('приймає HP 0 та очищення поля', async () => {
    await renderDashboard();
    changeField('Мінімальний HP', '0');
    expect(screen.getByLabelText('Мінімальний HP')).toHaveValue('0');
    expectSummary(12, 10, 4);
    changeField('Мінімальний HP', '115');
    expect(names()).toEqual(['Jigglypuff']);
    changeField('Мінімальний HP', '');
    expect(screen.getByLabelText('Мінімальний HP')).toHaveValue('');
    expectSummary(12, 10, 4);
  });

  it('скидає всі поля й KPI одразу, зберігаючи тему, лічильник і сортування', async () => {
    const user = userEvent.setup();
    const loadPokemon = await renderDashboard();
    await user.click(screen.getByRole('button', { name: 'Темна тема' }));
    await user.click(
      screen.getByRole('button', { name: 'Збільшити кількість' }),
    );
    await user.click(screen.getByRole('button', { name: 'HP' }));
    await user.click(screen.getByRole('button', { name: 'HP' }));
    vi.useFakeTimers();
    changeField('Назва Pokémon', 'ivy');
    changeField('Тип Pokémon', 'poison');
    changeField('Мінімальний HP', '60');
    act(() => vi.advanceTimersByTime(400));
    expect(names()).toEqual(['Ivysaur']);
    fireEvent.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    expect(screen.getByLabelText('Назва Pokémon')).toHaveValue('');
    expect(screen.getByLabelText('Тип Pokémon')).toHaveValue('all');
    expect(screen.getByLabelText('Мінімальний HP')).toHaveValue('');
    expect(names()).toHaveLength(12);
    expect(names()[0]).toBe('Jigglypuff');
    expectSummary(12, 10, 4);
    expect(screen.getByLabelText('Кількість у команді')).toHaveTextContent('1');
    expect(
      screen.getByRole('button', { name: 'Темна тема', pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Скинути фільтри' }),
    ).toBeDisabled();
    act(() => vi.advanceTimersByTime(400));
    expectSummary(12, 10, 4);
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });

  it('скидання скасовує незавершений debounce, порожній пошук відновлює вибірку', async () => {
    await renderDashboard();
    vi.useFakeTimers();
    changeField('Назва Pokémon', 'missing');
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    act(() => vi.advanceTimersByTime(400));
    expect(names()).toHaveLength(12);
    expectSummary(12, 10, 4);
    changeField('Назва Pokémon', 'ivy');
    act(() => vi.advanceTimersByTime(400));
    expect(names()).toEqual(['Ivysaur']);
    changeField('Назва Pokémon', '');
    expect(names()).toHaveLength(12);
    expectSummary(12, 10, 4);
  });

  it('не втрачає фокус після порожнього результату; Enter не перезавантажує форму', async () => {
    const user = userEvent.setup();
    const loadPokemon = await renderDashboard();
    const hp = screen.getByLabelText('Мінімальний HP');
    expect(hp).toHaveAccessibleDescription(
      'HP: ціле число від 0. Порожнє поле прибирає обмеження.',
    );
    await user.click(hp);
    await user.type(hp, '999');
    expect(
      screen.getByRole('heading', { name: 'Pokémon не знайдено' }),
    ).toBeInTheDocument();
    expect(hp).toHaveFocus();
    await user.keyboard('{Enter}{Tab}{Enter}');
    expect(names()).toHaveLength(12);
    expectSummary(12, 10, 4);
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });

  it('фільтрує дані справжнього клієнта без повторних HTTP-запитів', async () => {
    const fetcher = vi.fn<typeof fetch>(
      async (input) =>
        new Response(
          JSON.stringify(
            String(input).includes('?')
              ? apiList
              : apiPokemon.find(
                  (item) => item.name === String(input).split('/').at(-1),
                ),
          ),
        ),
    );
    render(<App loadPokemon={createPokeApiClient(fetcher).loadPokemon} />);
    await screen.findByRole('table');
    vi.useFakeTimers();
    changeField('Назва Pokémon', 'bulba');
    changeField('Тип Pokémon', 'poison');
    changeField('Мінімальний HP', '45');
    act(() => vi.advanceTimersByTime(400));
    expect(names()).toEqual(['bulbasaur']);
    expectSummary(1, 2, 1);
    fireEvent.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    expectSummary(3, 4, 1);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
});
