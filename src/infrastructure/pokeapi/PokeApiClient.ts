import type { LoadPokemon } from '../../application/pokemon/loadPokemon';
import type { Pokemon } from '../../domain/pokemon/types';
import { mapPokemon, parsePokemonList } from './mapper';

const baseUrl = 'https://pokeapi.co/api/v2/';
const pageSize = 20;
const batchSize = 4;

export function createPokeApiClient(fetcher: typeof fetch = fetch) {
  async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
    const response = await fetcher(`${baseUrl}${path}`, { signal });
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? 'PokeAPI: запитаний ресурс не знайдено (404).'
          : `PokeAPI: не вдалося завантажити дані (HTTP ${response.status}).`,
      );
    }
    return response.json();
  }

  const loadPokemon: LoadPokemon = async (signal) => {
    signal.throwIfAborted();
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
      return { pokemon, totalCount: list.count };
    } catch (error) {
      controller.abort();
      if (error instanceof TypeError) {
        throw new Error('Не вдалося з’єднатися з PokeAPI. Перевірте мережу.', {
          cause: error,
        });
      }
      if (error instanceof SyntaxError) {
        throw new Error('PokeAPI повернув відповідь у некоректному форматі.', {
          cause: error,
        });
      }
      throw error;
    } finally {
      signal.removeEventListener('abort', cancel);
    }
  };

  return { loadPokemon };
}
