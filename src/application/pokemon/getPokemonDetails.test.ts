import { describe, expect, it, vi } from 'vitest';
import { apiDetails, apiEvolution } from '../../../tests/fixtures/details';
import {
  mapEvolutionChain,
  mapPokemonDetails,
} from '../../infrastructure/pokeapi/detailsMapper';
import {
  createGetPokemonDetails,
  parsePokemonId,
  type PokemonDetailsRepository,
} from './getPokemonDetails';

function repository(): PokemonDetailsRepository {
  return {
    getPokemon: vi.fn(async () => mapPokemonDetails(apiDetails)),
    getEvolutionChainId: vi.fn(async () => 67),
    getEvolutionChain: vi.fn(async () => mapEvolutionChain(apiEvolution)),
  };
}

describe('GetPokemonDetails', () => {
  it.each([
    undefined,
    '',
    '0',
    '-1',
    '01',
    '1.5',
    '25x',
    ' 25',
    '9007199254740992',
  ])('не приймає ID %s', (value) => {
    expect(parsePokemonId(value)).toBeNull();
  });
  it('приймає додатний числовий ID', () =>
    expect(parsePokemonId('133')).toBe(133));

  it('завантажує species та chain з отриманими ID й одним signal', async () => {
    const repo = repository();
    const signal = new AbortController().signal;
    const result = await createGetPokemonDetails(repo)(signal, 133);
    expect(repo.getPokemon).toHaveBeenCalledWith(133, signal);
    expect(repo.getEvolutionChainId).toHaveBeenCalledWith(133, signal);
    expect(repo.getEvolutionChain).toHaveBeenCalledWith(67, signal);
    expect(result?.evolution?.evolvesTo).toHaveLength(8);
  });

  it('для 404 Pokémon не запитує інші ресурси', async () => {
    const repo = repository();
    vi.mocked(repo.getPokemon).mockResolvedValue(null);
    expect(
      await createGetPokemonDetails(repo)(new AbortController().signal, 999999),
    ).toBeNull();
    expect(repo.getEvolutionChainId).not.toHaveBeenCalled();
  });

  it('не запитує невідомий chain', async () => {
    const repo = repository();
    vi.mocked(repo.getEvolutionChainId).mockResolvedValue(null);
    expect(
      await createGetPokemonDetails(repo)(new AbortController().signal, 133),
    ).toMatchObject({ evolution: null, evolutionError: null });
    expect(repo.getEvolutionChain).not.toHaveBeenCalled();
  });

  it('зберігає деталі при помилці еволюцій, але повідомляє про неї', async () => {
    const repo = repository();
    vi.mocked(repo.getEvolutionChain).mockRejectedValue(new Error('HTTP 503'));
    expect(
      await createGetPokemonDetails(repo)(new AbortController().signal, 133),
    ).toMatchObject({
      pokemon: { name: 'eevee' },
      evolution: null,
      evolutionError: 'HTTP 503',
    });
  });

  it('не приховує скасування як помилку еволюцій', async () => {
    const repo = repository();
    const controller = new AbortController();
    vi.mocked(repo.getEvolutionChainId).mockImplementation(async () => {
      controller.abort();
      return 67;
    });
    await expect(
      createGetPokemonDetails(repo)(controller.signal, 133),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(repo.getEvolutionChain).not.toHaveBeenCalled();
  });
});
