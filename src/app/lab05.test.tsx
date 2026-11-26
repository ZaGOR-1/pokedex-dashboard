import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../tests/render';
import { deferred } from '../../tests/deferred';
import { apiPokemon } from '../../tests/fixtures/pokeapi';
import { apiDetails } from '../../tests/fixtures/details';
import { mapPokemon } from '../infrastructure/pokeapi/mapper';
import { mapPokemonDetails } from '../infrastructure/pokeapi/detailsMapper';
import { App } from './App';
import type { GetPokemonDetails } from '../application/pokemon/getPokemonDetails';
import type { GetPokemonTypeCount } from '../application/pokemon/getPokemonTypeCount';
import { useDashboardStore } from './dashboardStore';

afterEach(() => vi.useRealTimers());

async function renderDashboard(
  getPokemonTypeCount: GetPokemonTypeCount = async () => 10,
) {
  const loadPokemon = vi.fn(async () => ({
    pokemon: apiPokemon.map(mapPokemon),
    totalCount: 1351,
  }));
  const getPokemonDetails = vi.fn<GetPokemonDetails>(async (_signal, id) => ({
    ...mapPokemonDetails({
      ...apiDetails,
      ...(apiPokemon.find((item) => item.id === id) ?? apiDetails),
    }),
    evolution: null,
    evolutionError: null,
  }));
  renderWithProviders(
    <App
      loadPokemon={loadPokemon}
      getPokemonDetails={getPokemonDetails}
      getPokemonTypeCount={getPokemonTypeCount}
    />,
  );
  await screen.findByRole('table');
  return { loadPokemon, getPokemonDetails };
}

function chartValue(label: string) {
  const values = screen.getByLabelText('Середні характеристики вибірки');
  return within(values)
    .getByText(label, { selector: 'dt' })
    .nextElementSibling?.querySelector('span')?.textContent;
}

describe('ЛР №5: спільний стан та графіки', () => {
  it('синхронізує поля з зовнішніми actions store та reset', async () => {
    await renderDashboard();
    act(() => {
      const state = useDashboardStore.getState();
      state.setSearch('bulba');
      state.setType('poison');
      state.setMinHp('45');
    });
    expect(screen.getByLabelText('Назва Pokémon')).toHaveValue('bulba');
    expect(screen.getByLabelText('Тип Pokémon')).toHaveValue('poison');
    expect(screen.getByLabelText('Мінімальний HP')).toHaveValue('45');
    act(() => useDashboardStore.getState().resetFilters());
    expect(screen.getByLabelText('Назва Pokémon')).toHaveValue('');
    expect(screen.getByLabelText('Тип Pokémon')).toHaveValue('all');
    expect(screen.getByLabelText('Мінімальний HP')).toHaveValue('');
  });

  it('не втрачає фокус, символи та позицію курсора при друку', async () => {
    await renderDashboard();
    const user = userEvent.setup();
    const input = screen.getByRole<HTMLInputElement>('searchbox');
    await user.type(input, 'bulbasaur');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('bulbasaur');
    input.setSelectionRange(3, 3);
    await user.type(input, 'x', { skipClick: true });
    expect(input).toHaveValue('bulxbasaur');
    expect(input.selectionStart).toBe(4);
    expect(useDashboardStore.getState().filters.search).toBe('bulxbasaur');
  });

  it('відхиляє некоректний HP через форму й прибирає помилку після коректного вводу', async () => {
    await renderDashboard();
    const hp = screen.getByLabelText('Мінімальний HP');
    fireEvent.change(hp, { target: { value: '45' } });
    fireEvent.change(hp, { target: { value: '-1' } });
    expect(hp).toHaveValue('45');
    expect(hp).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Укажіть');
    expect(useDashboardStore.getState().filters.minHp).toBe('45');
    fireEvent.change(hp, { target: { value: '0' } });
    expect(hp).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    ['Назва Pokémon', 'bulba', '45'],
    ['Тип Pokémon', 'fire', '39'],
    ['Мінімальний HP', '45', '45'],
  ])(
    'графік, таблиця й KPI реагують на %s без запитів',
    async (label, value, expectedHp) => {
      const { loadPokemon } = await renderDashboard();
      expect(chartValue('HP')).toBe('42,7');
      vi.useFakeTimers();
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
      if (label === 'Назва Pokémon') {
        act(() => vi.advanceTimersByTime(399));
        expect(chartValue('HP')).toBe('42,7');
        act(() => vi.advanceTimersByTime(1));
      }
      expect(chartValue('HP')).toBe(expectedHp);
      expect(
        within(screen.getByRole('table')).getAllByRole('rowheader'),
      ).toHaveLength(1);
      expect(
        within(
          screen.getByRole('article', { name: 'Pokémon у вибірці' }),
        ).getByText('1'),
      ).toBeInTheDocument();
      expect(loadPokemon).toHaveBeenCalledTimes(1);
    },
  );

  it('після швидкого reset таймер не повертає старий пошук; режим, тема й обране збережені', async () => {
    const { loadPokemon } = await renderDashboard();
    act(() => {
      useDashboardStore.getState().toggleTheme();
      useDashboardStore.getState().addFavorite(1);
      useDashboardStore.getState().setChartType('line');
    });
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText('Назва Pokémon'), {
      target: { value: 'bulba' },
    });
    act(() => vi.advanceTimersByTime(250));
    fireEvent.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    expect(chartValue('HP')).toBe('42,7');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByLabelText('Назва Pokémon')).toHaveValue('');
    expect(chartValue('HP')).toBe('42,7');
    expect(useDashboardStore.getState()).toMatchObject({
      theme: 'dark',
      favoriteIds: [1],
      chartType: 'line',
    });
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });

  it('після reset нове введення не повертає вже застосований пошук', async () => {
    await renderDashboard();
    vi.useFakeTimers();
    const search = screen.getByRole<HTMLInputElement>('searchbox');
    fireEvent.change(search, { target: { value: 'bulba' } });
    act(() => vi.advanceTimersByTime(400));
    expect(chartValue('HP')).toBe('45');

    fireEvent.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    expect(search).toHaveValue('');
    expect(chartValue('HP')).toBe('42,7');
    search.focus();
    fireEvent.change(search, { target: { value: 'char' } });
    search.setSelectionRange(2, 2);
    act(() => vi.advanceTimersByTime(399));
    expect(chartValue('HP')).toBe('42,7');
    expect(
      within(screen.getByRole('table')).getAllByRole('rowheader'),
    ).toHaveLength(3);
    expect(useDashboardStore.getState().filters.search).toBe('char');
    act(() => vi.advanceTimersByTime(1));
    expect(chartValue('HP')).toBe('39');
    expect(search).toHaveFocus();
    expect(search.selectionStart).toBe(2);
  });

  it('обидва режими використовують однакові значення; порожня вибірка прибирає SVG', async () => {
    const { loadPokemon } = await renderDashboard();
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Лінійний' }));
    expect(chartValue('HP')).toBe('42,7');
    expect(useDashboardStore.getState().chartType).toBe('line');
    fireEvent.change(screen.getByLabelText('Мінімальний HP'), {
      target: { value: '999' },
    });
    expect(
      screen.getByText(/Немає Pokémon для побудови графіка/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('application')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    expect(chartValue('HP')).toBe('42,7');
    expect(screen.getByRole('radio', { name: 'Лінійний' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Стовпчиковий' }));
    expect(chartValue('HP')).toBe('42,7');
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });

  it('обране синхронізоване між таблицею і деталями та не залежить від фільтра', async () => {
    await renderDashboard();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Обране: bulbasaur' }));
    fireEvent.change(screen.getByLabelText('Тип Pokémon'), {
      target: { value: 'fire' },
    });
    expect(useDashboardStore.getState().favoriteIds).toEqual([1]);
    await user.click(screen.getByRole('button', { name: 'Скинути фільтри' }));
    expect(
      screen.getByRole('button', { name: 'Обране: bulbasaur' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('radio', { name: 'Лінійний' }));
    await user.click(screen.getByRole('link', { name: 'bulbasaur' }));
    await screen.findByRole('heading', { name: 'bulbasaur' });
    await user.click(screen.getByRole('button', { name: 'Обране: bulbasaur' }));
    expect(useDashboardStore.getState().favoriteIds).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Обране: bulbasaur' }));
    await user.click(screen.getByRole('link', { name: /Назад до дашборду/ }));
    await screen.findByRole('table');
    expect(
      screen.getByRole('button', { name: 'Обране: bulbasaur' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('radio', { name: 'Лінійний' })).toBeChecked();
  });
});

describe('KPI за типом', () => {
  it('оновлює розподіл за вибіркою без запитів у режимі всіх типів', async () => {
    const getPokemonTypeCount = vi.fn<GetPokemonTypeCount>();
    await renderDashboard(getPokemonTypeCount);
    const distribution = within(
      screen.getByRole('article', {
        name: 'Розподіл Pokémon за типами у вибірці',
      }),
    );
    expect(
      distribution.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['fire · 1', 'grass · 1', 'poison · 1', 'water · 1']);

    const hp = screen.getByLabelText('Мінімальний HP');
    fireEvent.change(hp, { target: { value: '45' } });
    expect(
      distribution.getAllByRole('listitem').map((item) => item.textContent),
    ).toEqual(['grass · 1', 'poison · 1']);
    fireEvent.change(hp, { target: { value: '999' } });
    expect(distribution.queryByRole('list')).not.toBeInTheDocument();
    expect(
      distribution.getByText('У вибірці немає даних про типи.'),
    ).toBeInTheDocument();
    expect(getPokemonTypeCount).not.toHaveBeenCalled();
  });

  it('показує локальні результати під час збою глобального KPI та окремо повторює запит', async () => {
    const first = deferred<number>();
    const getPokemonTypeCount = vi
      .fn<GetPokemonTypeCount>()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(17);
    const { loadPokemon } = await renderDashboard(getPokemonTypeCount);
    const local = within(
      screen.getByRole('article', { name: 'Pokémon у вибірці' }),
    );
    const type = screen.getByLabelText('Тип Pokémon');
    fireEvent.change(type, { target: { value: 'poison' } });
    expect(
      local.getByText('Записи типу poison після застосування фільтрів'),
    ).toBeInTheDocument();
    expect(local.getByText('1')).toBeInTheDocument();
    expect(
      screen.getByText('Завантаження статистики типу poison…'),
    ).toBeInTheDocument();
    await act(async () => first.reject(new Error('HTTP 503')));
    expect(screen.getByRole('alert')).toHaveTextContent('HTTP 503');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(chartValue('HP')).toBe('45');
    fireEvent.click(
      screen.getByRole('button', { name: 'Повторити запит статистики' }),
    );
    const global = within(
      await screen.findByRole('article', {
        name: 'Записів типу poison в усій базі PokeAPI',
      }),
    );
    expect(global.getByText('17')).toBeInTheDocument();

    vi.useFakeTimers();
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'char' },
    });
    act(() => vi.advanceTimersByTime(400));
    expect(local.getByText('0')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Мінімальний HP'), {
      target: { value: '999' },
    });
    expect(global.getByText('17')).toBeInTheDocument();
    expect(
      getPokemonTypeCount.mock.calls.map(([, selected]) => selected),
    ).toEqual(['poison', 'poison']);
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });

  it('скасовує запит при швидкій зміні типу та ігнорує старі відповіді', async () => {
    const fire = deferred<number>();
    const water = deferred<number>();
    const getPokemonTypeCount = vi
      .fn<GetPokemonTypeCount>()
      .mockReturnValueOnce(fire.promise)
      .mockReturnValueOnce(water.promise)
      .mockResolvedValueOnce(19);
    await renderDashboard(getPokemonTypeCount);
    const type = screen.getByLabelText('Тип Pokémon');
    fireEvent.change(type, { target: { value: 'fire' } });
    fireEvent.change(type, { target: { value: 'water' } });
    expect(getPokemonTypeCount.mock.calls[0]?.[0].aborted).toBe(true);
    await act(async () => fire.resolve(99));
    expect(screen.queryByText('99')).not.toBeInTheDocument();
    expect(
      screen.getByText('Завантаження статистики типу water…'),
    ).toBeInTheDocument();
    fireEvent.change(type, { target: { value: 'all' } });
    expect(getPokemonTypeCount.mock.calls[1]?.[0].aborted).toBe(true);
    fireEvent.change(type, { target: { value: 'fire' } });
    const global = within(
      await screen.findByRole('article', {
        name: 'Записів типу fire в усій базі PokeAPI',
      }),
    );
    await act(async () => water.reject(new Error('Застаріла помилка')));
    expect(global.getByText('19')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      getPokemonTypeCount.mock.calls.map(([, selected]) => selected),
    ).toEqual(['fire', 'water', 'fire']);
  });
});
