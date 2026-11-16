import type {
  EvolutionNode,
  PokemonDetails,
} from '../../domain/pokemon/details';

export interface PokemonDetailsRepository {
  getPokemon(
    id: number,
    signal: AbortSignal,
  ): Promise<{
    pokemon: PokemonDetails;
    speciesId: number;
  } | null>;
  getEvolutionChainId(
    speciesId: number,
    signal: AbortSignal,
  ): Promise<number | null>;
  getEvolutionChain(
    id: number,
    signal: AbortSignal,
  ): Promise<EvolutionNode | null>;
}

export interface PokemonDetailsResult {
  readonly pokemon: PokemonDetails;
  readonly evolution: EvolutionNode | null;
  readonly evolutionError: string | null;
}

export type GetPokemonDetails = (
  signal: AbortSignal,
  id: number,
) => Promise<PokemonDetailsResult | null>;

export function parsePokemonId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function createGetPokemonDetails(
  repository: PokemonDetailsRepository,
): GetPokemonDetails {
  return async (signal, id) => {
    signal.throwIfAborted();
    const details = await repository.getPokemon(id, signal);
    signal.throwIfAborted();
    if (!details) return null;

    try {
      const chainId = await repository.getEvolutionChainId(
        details.speciesId,
        signal,
      );
      signal.throwIfAborted();
      const evolution =
        chainId === null
          ? null
          : await repository.getEvolutionChain(chainId, signal);
      signal.throwIfAborted();
      return { pokemon: details.pokemon, evolution, evolutionError: null };
    } catch (error: unknown) {
      signal.throwIfAborted();
      return {
        pokemon: details.pokemon,
        evolution: null,
        evolutionError:
          error instanceof Error
            ? error.message
            : 'Не вдалося завантажити еволюції.',
      };
    }
  };
}
