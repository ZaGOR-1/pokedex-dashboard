import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../tests/deferred';
import {
  apiDetails,
  apiEvolution,
  apiSpecies,
  eeveeEvolutions,
} from '../../tests/fixtures/details';
import { mockPokemon } from '../../tests/fixtures/mockPokemon';
import {
  createGetPokemonDetails,
  type GetPokemonDetails,
  type PokemonDetailsResult,
} from '../application/pokemon/getPokemonDetails';
import { createPokeApiClient } from '../infrastructure/pokeapi/PokeApiClient';
import { mapPokemonDetails } from '../infrastructure/pokeapi/detailsMapper';
import { App } from './App';

const response = (data: unknown) => new Response(JSON.stringify(data));
const loadPokemon = async () => ({ pokemon: mockPokemon, totalCount: 1351 });

function renderRoute(
  path: string,
  fetcher = vi.fn<typeof fetch>(async (input) => {
    const url = String(input);
    return response(
      url.includes('pokemon-species')
        ? apiSpecies
        : url.includes('evolution-chain')
          ? apiEvolution
          : apiDetails,
    );
  }),
) {
  const client = createPokeApiClient(fetcher);
  render(
    <MemoryRouter initialEntries={[path]}>
      <App
        loadPokemon={loadPokemon}
        getPokemonDetails={createGetPokemonDetails(client.detailsRepository)}
        getPokemonTypeCount={async () => 10}
      />
    </MemoryRouter>,
  );
  return fetcher;
}

describe('Маршрути ЛР №4', () => {
  it('повідомляє про некоректний JSON null замість удаваної 404', async () => {
    renderRoute(
      '/pokemon/133',
      vi.fn<typeof fetch>(async () => response(null)),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'некоректні дані Pokémon',
    );
    expect(
      screen.queryByRole('heading', { name: 'Pokémon не знайдено' }),
    ).not.toBeInTheDocument();
  });

  it('замінює зламане зображення текстовим повідомленням', async () => {
    renderRoute('/pokemon/133');
    const image = await screen.findByRole('img', { name: 'eevee' });
    fireEvent.error(image);
    expect(screen.getByText('Зображення недоступне.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it.each(['pokemon-species', 'evolution-chain'])(
    'не плутає відсутній %s із відсутнім Pokémon',
    async (resource) => {
      renderRoute(
        '/pokemon/133',
        vi.fn<typeof fetch>(async (input) => {
          const url = String(input);
          if (url.includes(resource))
            return new Response(null, { status: 404 });
          return response(
            url.includes('pokemon-species') ? apiSpecies : apiDetails,
          );
        }),
      );
      expect(
        await screen.findByRole('heading', { name: 'eevee' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Інформація про ланцюжок еволюцій недоступна.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('відкриває деталі зі списку, показує шість stats, здібності й усі гілки Eevee', async () => {
    const user = userEvent.setup();
    const fetcher = renderRoute('/');
    await screen.findByRole('table');
    await user.selectOptions(screen.getByRole('combobox'), 'normal');
    await user.click(screen.getByRole('button', { name: 'Темна тема' }));
    await user.click(screen.getByRole('link', { name: 'Eevee' }));
    expect(
      await screen.findByRole('heading', { name: 'eevee' }),
    ).toBeInTheDocument();
    const article = screen.getByRole('article', { name: 'eevee' });
    expect(within(article).getAllByRole('term')).toHaveLength(6);
    expect(within(article).getByText('run-away')).toBeInTheDocument();
    expect(within(article).getByText('adaptability')).toBeInTheDocument();
    for (const name of eeveeEvolutions)
      expect(within(article).getByText(name)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'eevee' })).toHaveAttribute(
      'src',
      apiDetails.sprites.front_default,
    );
    expect(screen.getByRole('button', { name: 'Темна тема' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Темна тема' }));
    await user.click(screen.getByRole('link', { name: /Назад до дашборду/ }));
    await screen.findByRole('table');
    expect(screen.getByRole('combobox')).toHaveValue('normal');
    expect(screen.getByRole('button', { name: 'Темна тема' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('підтримує прямий URL і не завантажує список на сторінці деталей', async () => {
    const list = vi.fn(loadPokemon);
    const details = vi.fn<GetPokemonDetails>(async () => ({
      ...mapPokemonDetails(apiDetails),
      evolution: null,
      evolutionError: null,
    }));
    render(
      <MemoryRouter initialEntries={['/pokemon/133']}>
        <App loadPokemon={list} getPokemonDetails={details} />
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { name: 'eevee' });
    expect(list).not.toHaveBeenCalled();
    expect(details).toHaveBeenCalledWith(expect.any(AbortSignal), 133);
  });

  it.each([
    '/pokemon/0',
    '/pokemon/-2',
    '/pokemon/abc',
    '/pokemon/1.5',
    '/pokemon/01',
    '/pokemon/9007199254740992',
  ])('не запитує API для некоректного ID %s', (path) => {
    const fetcher = renderRoute(path);
    expect(
      screen.getByRole('heading', { name: 'Некоректний ID Pokémon' }),
    ).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(['/pokemon', '/pokemon/', '/unknown', '/pokemon/133/extra'])(
    'пояснює невідомий маршрут %s',
    (path) => {
      const fetcher = renderRoute(path);
      expect(
        screen.getByRole('heading', { name: 'Сторінку не знайдено' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Назад/ })).toHaveAttribute(
        'href',
        '/',
      );
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it('відрізняє 404 Pokémon від помилки API', async () => {
    const fetcher = renderRoute(
      '/pokemon/999999',
      vi.fn<typeof fetch>(async () => new Response(null, { status: 404 })),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Завантаження');
    expect(
      await screen.findByRole('heading', { name: 'Pokémon не знайдено' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([503, 'network'] as const)(
    'дає повторити помилку %s',
    async (failure) => {
      const user = userEvent.setup();
      const fetcher = vi.fn<typeof fetch>(async (input) =>
        response(
          String(input).includes('pokemon-species')
            ? { evolution_chain: null }
            : apiDetails,
        ),
      );
      if (failure === 'network')
        fetcher.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      else
        fetcher.mockResolvedValueOnce(new Response(null, { status: failure }));
      renderRoute('/pokemon/133', fetcher);
      expect(await screen.findByRole('alert')).toHaveTextContent(
        failure === 503 ? '503' : 'Перевірте мережу',
      );
      await user.click(screen.getByRole('button', { name: 'Повторити запит' }));
      await screen.findByRole('heading', { name: 'eevee' });
      expect(
        screen.getByText('Інформація про ланцюжок еволюцій недоступна.'),
      ).toBeInTheDocument();
      expect(fetcher).toHaveBeenCalledTimes(3);
    },
  );

  it('показує деталі й повідомлення, якщо еволюції повернули помилку', async () => {
    renderRoute(
      '/pokemon/133',
      vi.fn<typeof fetch>(async (input) =>
        String(input).includes('pokemon-species')
          ? new Response(null, { status: 503 })
          : response(apiDetails),
      ),
    );
    await screen.findByRole('heading', { name: 'eevee' });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Не вдалося завантажити еволюції',
    );
    expect(screen.getByText('run-away')).toBeInTheDocument();
  });

  it.each(['success', 'error'] as const)(
    'скасовує старий route-запит та ігнорує пізній %s',
    async (outcome) => {
      const user = userEvent.setup();
      const pending = deferred<PokemonDetailsResult | null>();
      const getDetails = vi.fn<GetPokemonDetails>((_signal, id) =>
        id === 133
          ? pending.promise
          : Promise.resolve({
              pokemon: {
                ...mapPokemonDetails(apiDetails).pokemon,
                id: 25,
                name: 'pikachu',
              },
              evolution: null,
              evolutionError: null,
            }),
      );
      render(
        <MemoryRouter initialEntries={['/pokemon/133']}>
          <Link to="/pokemon/25">Інший Pokémon</Link>
          <App loadPokemon={loadPokemon} getPokemonDetails={getDetails} />
        </MemoryRouter>,
      );
      expect(screen.getByRole('status')).toHaveTextContent('Завантаження');
      await user.click(screen.getByRole('link', { name: 'Інший Pokémon' }));
      await screen.findByRole('heading', { name: 'pikachu' });
      expect(getDetails.mock.calls[0]![0].aborted).toBe(true);
      await act(async () => {
        if (outcome === 'success')
          pending.resolve({
            pokemon: mapPokemonDetails(apiDetails).pokemon,
            evolution: null,
            evolutionError: null,
          });
        else pending.reject(new Error('Стара помилка'));
      });
      expect(
        screen.queryByRole('heading', { name: 'eevee' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'pikachu' }),
      ).toBeInTheDocument();
    },
  );
});
