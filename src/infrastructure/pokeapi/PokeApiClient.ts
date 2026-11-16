import type {
  LoadPokemon,
  PokemonPage,
} from '../../application/pokemon/loadPokemon';
import type { PokemonDetailsRepository } from '../../application/pokemon/getPokemonDetails';
import type { Pokemon } from '../../domain/pokemon/types';
import { mapPokemon, parsePokemonList } from './mapper';
import {
  mapEvolutionChain,
  mapEvolutionChainId,
  mapPokemonDetails,
} from './detailsMapper';

const baseUrl = 'https://pokeapi.co/api/v2/';
const pageSize = 20;
const batchSize = 4;
// Відрізняємо HTTP 404 від некоректного JSON null у відповіді 200.
const missingResource = Symbol('HTTP 404');

export function createPokeApiClient(fetcher: typeof fetch = fetch) {
  let cachedPage: PokemonPage | null = null;

  async function getJson(
    path: string,
    signal: AbortSignal,
    allowMissing = false,
  ): Promise<unknown> {
    signal.throwIfAborted();
    let response: Response;
    try {
      response = await fetcher(`${baseUrl}${path}`, { signal });
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof TypeError) {
        throw new Error('Не вдалося з’єднатися з PokeAPI. Перевірте мережу.', {
          cause: error,
        });
      }
      throw error;
    }
    signal.throwIfAborted();
    if (allowMissing && response.status === 404) return missingResource;
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? 'PokeAPI: запитаний ресурс не знайдено (404).'
          : `PokeAPI: не вдалося завантажити дані (HTTP ${response.status}).`,
      );
    }
    try {
      return await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('PokeAPI повернув відповідь у некоректному форматі.', {
          cause: error,
        });
      }
      throw error;
    }
  }

  const loadPokemon: LoadPokemon = async (signal) => {
    signal.throwIfAborted();
    if (cachedPage) return cachedPage;
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal.addEventListener('abort', cancel, { once: true });

    try {
      const list = parsePokemonList(
        await getJson('pokemon?limit=20&offset=0', controller.signal),
      );
      if (list.results.length > pageSize) {
        throw new Error('PokeAPI повернув більше записів, ніж запитано.');
      }
      const pokemon: Pokemon[] = [];
      for (let index = 0; index < list.results.length; index += batchSize) {
        controller.signal.throwIfAborted();
        const batch = list.results.slice(index, index + batchSize);
        const records = await Promise.all(
          batch.map(async ({ name }) =>
            mapPokemon(await getJson(`pokemon/${name}`, controller.signal)),
          ),
        );
        pokemon.push(...records);
      }
      controller.signal.throwIfAborted();
      cachedPage = { pokemon, totalCount: list.count };
      return cachedPage;
    } catch (error) {
      controller.abort();
      throw error;
    } finally {
      signal.removeEventListener('abort', cancel);
    }
  };

  const detailsRepository: PokemonDetailsRepository = {
    async getPokemon(id, signal) {
      const value = await getJson(`pokemon/${id}`, signal, true);
      if (value === missingResource) return null;
      const details = mapPokemonDetails(value);
      if (details.pokemon.id !== id)
        throw new Error('PokeAPI повернув інший ID Pokémon.');
      return details;
    },
    async getEvolutionChainId(speciesId, signal) {
      const value = await getJson(`pokemon-species/${speciesId}`, signal, true);
      return value === missingResource ? null : mapEvolutionChainId(value);
    },
    async getEvolutionChain(id, signal) {
      const value = await getJson(`evolution-chain/${id}`, signal, true);
      return value === missingResource ? null : mapEvolutionChain(value);
    },
  };

  return { loadPokemon, detailsRepository };
}
