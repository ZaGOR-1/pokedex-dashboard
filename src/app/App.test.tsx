import { StrictMode } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  LoadPokemon,
  PokemonPage,
} from '../application/pokemon/loadPokemon';
import { PokemonDashboard } from '../components/PokemonDashboard';
import { createPokeApiClient } from '../infrastructure/pokeapi/PokeApiClient';
import { deferred } from '../../tests/deferred';
import { mockPokemon } from '../../tests/fixtures/mockPokemon';
import { apiList, apiPokemon } from '../../tests/fixtures/pokeapi';
import { App } from './App';

const page: PokemonPage = { pokemon: mockPokemon, totalCount: 1350 };
const loadPage: LoadPokemon = async () => page;
const jsonResponse = (data: unknown) => new Response(JSON.stringify(data));

function detailResponse(input: RequestInfo | URL) {
  const name = String(input).split('/').at(-1);
  return jsonResponse(apiPokemon.find((item) => item.name === name));
}

function expectKpi(title: string, value: string) {
  expect(
    within(screen.getByRole('article', { name: title })).getByText(value),
  ).toBeInTheDocument();
}

describe('App: дані API', () => {
  it('показує loading, потім шість полів таблиці й окремий глобальний KPI', async () => {
    const pending = deferred<Response>();
    const fetcher = vi.fn<typeof fetch>(async (input) =>
      String(input).includes('?') ? pending.promise : detailResponse(input),
    );
    render(<App loadPokemon={createPokeApiClient(fetcher).loadPokemon} />);
    expect(screen.getByText('Завантаження Pokémon…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    for (const title of [
      'Усього записів Pokémon',
      'Pokémon у вибірці',
      'Типів у вибірці',
      'Із двома типами',
    ])
      expectKpi(title, '—');
    await act(async () => pending.resolve(jsonResponse(apiList)));
    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(6);
    const row = within(table).getByRole('row', { name: /bulbasaur/ });
    expect(within(row).getByText('#001')).toBeInTheDocument();
    expect(within(row).getByText('grass')).toBeInTheDocument();
    expect(within(row).getByText('poison')).toBeInTheDocument();
    expect(within(row).getByText('45')).toBeInTheDocument();
    expect(within(row).getAllByText('49')).toHaveLength(2);
    expectKpi('Усього записів Pokémon', '1350');
    expectKpi('Pokémon у вибірці', '3');
    expectKpi('Типів у вибірці', '4');
    expectKpi('Із двома типами', '1');
    expect(screen.queryByText('демонстраційна зміна')).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it.each([404, 503, 'network'] as const)(
    'показує помилку %s і повторює запит лише після натискання',
    async (failure) => {
      const user = userEvent.setup();
      const retryResponse = deferred<Response>();
      const fetcher = vi.fn<typeof fetch>(async (input) =>
        detailResponse(input),
      );
      if (failure === 'network')
        fetcher.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      else
        fetcher.mockResolvedValueOnce(new Response(null, { status: failure }));
      fetcher.mockReturnValueOnce(retryResponse.promise);
      render(<App loadPokemon={createPokeApiClient(fetcher).loadPokemon} />);
      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent(
        failure === 'network'
          ? 'Не вдалося з’єднатися з PokeAPI'
          : String(failure),
      );
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expectKpi('Pokémon у вибірці', '—');
      expect(fetcher).toHaveBeenCalledTimes(1);
      await user.click(
        screen.getByRole('button', { name: 'Збільшити кількість' }),
      );
      await user.click(screen.getByRole('button', { name: 'Повторити запит' }));
      expect(screen.getByText('Завантаження Pokémon…')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      await act(async () => retryResponse.resolve(jsonResponse(apiList)));
      expect(await screen.findByRole('table')).toBeInTheDocument();
      expect(fetcher).toHaveBeenCalledTimes(5);
      expect(screen.getByLabelText('Кількість у команді')).toHaveTextContent(
        '1',
      );
    },
  );

  it('відрізняє порожню відповідь від помилки та показує справжній count', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ count: 1350, results: [] }));
    render(<App loadPokemon={createPokeApiClient(fetcher).loadPokemon} />);
    expect(
      await screen.findByText('PokeAPI повернув порожній список'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expectKpi('Усього записів Pokémon', '1350');
    expectKpi('Pokémon у вибірці', '0');
    expectKpi('Типів у вибірці', '0');
    expectKpi('Із двома типами', '0');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('App: нові типи API', () => {
  it('завантажує сторінку з нестандартним типом і враховує його в KPI', async () => {
    const fetcher = vi.fn<typeof fetch>(async (input) =>
      jsonResponse(
        String(input).includes('?')
          ? { count: apiList.count, results: apiList.results.slice(0, 1) }
          : {
              ...apiPokemon[0],
              types: [
                { slot: 1, type: { name: 'grass' } },
                { slot: 2, type: { name: 'stellar' } },
              ],
            },
      ),
    );
    render(<App loadPokemon={createPokeApiClient(fetcher).loadPokemon} />);
    const table = await screen.findByRole('table');
    expect(within(table).getByText('stellar')).toHaveClass('type-badge');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expectKpi('Pokémon у вибірці', '1');
    expectKpi('Типів у вибірці', '2');
    expectKpi('Із двома типами', '1');
    expect(
      screen.queryByRole('option', { name: 'stellar' }),
    ).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('App: попередні віджети', () => {
  it('зберігає стан теми й лічильника після фільтра та сортування без нових запитів', async () => {
    const user = userEvent.setup();
    const loadPokemon = vi.fn(loadPage);
    render(<App loadPokemon={loadPokemon} />);
    await screen.findByRole('table');
    await user.click(
      screen.getByRole('button', { name: 'Збільшити кількість' }),
    );
    await user.selectOptions(screen.getByRole('combobox'), 'water');
    await user.click(screen.getByRole('button', { name: 'HP' }));
    await user.click(
      screen.getByRole('button', { name: 'Темна тема', pressed: false }),
    );
    expect(screen.getByLabelText('Кількість у команді')).toHaveTextContent('1');
    expect(screen.getByRole('combobox')).toHaveValue('water');
    expect(screen.getByText('Squirtle')).toBeInTheDocument();
    expect(screen.getByText('Wartortle')).toBeInTheDocument();
    expect(screen.queryByText('Charmander')).not.toBeInTheDocument();
    expectKpi('Pokémon у вибірці', '12');
    expectKpi('Типів у вибірці', '10');
    expectKpi('Із двома типами', '4');
    await user.click(screen.getByRole('button', { name: 'Скинути фільтр' }));
    expect(screen.getByRole('combobox')).toHaveValue('all');
    expect(screen.getByLabelText('Кількість у команді')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Темна тема' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(loadPokemon).toHaveBeenCalledTimes(1);
  });
});

describe('PokemonDashboard: життєвий цикл', () => {
  it('скасовує signal під час unmount та ігнорує пізній результат', async () => {
    const pending = deferred<PokemonPage>();
    const loadPokemon = vi.fn<LoadPokemon>(() => pending.promise);
    const { unmount, container } = render(
      <PokemonDashboard loadPokemon={loadPokemon} />,
    );
    const signal = loadPokemon.mock.calls[0]![0];
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => pending.resolve(page));
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['success', 'error'])(
    'застаріла відповідь %s не замінює нову',
    async (outcome) => {
      const pending = deferred<PokemonPage>();
      const first = vi.fn<LoadPokemon>(() => pending.promise);
      const second: LoadPokemon = async () => ({
        pokemon: [mockPokemon[2]!],
        totalCount: 77,
      });
      const { rerender } = render(<PokemonDashboard loadPokemon={first} />);
      rerender(<PokemonDashboard loadPokemon={second} />);
      await screen.findByRole('table');
      expect(first.mock.calls[0]![0].aborted).toBe(true);
      await act(async () => {
        if (outcome === 'success') pending.resolve(page);
        else pending.reject(new Error('Застаріла помилка'));
      });
      expect(screen.getByText('Charmander')).toBeInTheDocument();
      expect(screen.queryByText('Bulbasaur')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expectKpi('Усього записів Pokémon', '77');
    },
  );

  it('витримує повторний запуск ефекту в StrictMode', async () => {
    const first = deferred<PokemonPage>();
    const loadPokemon = vi
      .fn<LoadPokemon>(() => first.promise)
      .mockResolvedValueOnce(page);
    render(
      <StrictMode>
        <PokemonDashboard loadPokemon={loadPokemon} />
      </StrictMode>,
    );
    expect(loadPokemon).toHaveBeenCalledTimes(2);
    expect(loadPokemon.mock.calls[0]![0].aborted).toBe(true);
    expect(loadPokemon.mock.calls[1]![0].aborted).toBe(false);
    await act(async () => first.resolve(page));
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
